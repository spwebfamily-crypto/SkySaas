import type { ProviderResult, SearchQuery, SearchResult } from "@/lib/search/types";
import {
  buildBadges,
  fetchWithTimeout,
  minutesBetween,
  missingProvider,
  parseIsoDurationToMinutes,
  scoreResult,
  withProviderTiming,
} from "@/lib/search/utils";

type DuffelOffer = {
  id: string;
  total_amount: string;
  total_currency: string;
  owner?: { name?: string; iata_code?: string };
  slices?: Array<{
    duration?: string;
    segments?: Array<{
      departing_at?: string;
      arriving_at?: string;
      origin?: { iata_code?: string };
      destination?: { iata_code?: string };
      marketing_carrier?: { name?: string; iata_code?: string };
      marketing_carrier_flight_number?: string;
      passengers?: Array<{
        cabin_class?: string;
      }>;
    }>;
  }>;
};

type DuffelResponse = {
  data?: {
    offers?: DuffelOffer[];
  };
};

function mapCabin(cabin: SearchQuery["cabin"]) {
  const map = {
    economy: "economy",
    premium_economy: "premium_economy",
    business: "business",
    first: "first",
  };

  return map[cabin];
}

function normalizeOffer(offer: DuffelOffer): SearchResult | null {
  const slice = offer.slices?.[0];
  const firstSegment = slice?.segments?.[0];
  const lastSegment = slice?.segments?.at(-1);
  const price = Number(offer.total_amount);

  if (!firstSegment?.departing_at || !lastSegment?.arriving_at || !price) {
    return null;
  }

  const carrier = firstSegment.marketing_carrier ?? offer.owner;
  const durationMin =
    parseIsoDurationToMinutes(slice?.duration) ||
    minutesBetween(firstSegment.departing_at, lastSegment.arriving_at);
  const result: SearchResult = {
    id: `duffel-${offer.id}`,
    provider: "duffel",
    source: "Duffel NDC",
    airline: carrier?.name ?? "Duffel offer",
    flightNumber: `${carrier?.iata_code ?? ""}${firstSegment.marketing_carrier_flight_number ?? ""}`,
    route: `${firstSegment.origin?.iata_code ?? "?"} -> ${lastSegment.destination?.iata_code ?? "?"}`,
    cashPrice: price,
    currency: offer.total_currency,
    miles: null,
    taxes: null,
    program: null,
    durationMin,
    stops: Math.max((slice?.segments?.length ?? 1) - 1, 0),
    departure: firstSegment.departing_at,
    arrival: lastSegment.arriving_at,
    cabin: firstSegment.passengers?.[0]?.cabin_class ?? "economy",
    bookingUrl: null,
    seatsLeft: null,
    score: 0,
    badges: [],
  };

  result.score = scoreResult(result);
  result.badges = buildBadges(result);

  return result;
}

export async function searchDuffel(query: SearchQuery): Promise<ProviderResult> {
  if (!process.env.DUFFEL_API_KEY) {
    return missingProvider(
      "duffel",
      "Duffel",
      "Configure DUFFEL_API_KEY para ativar NDC e ofertas cash.",
    );
  }

  return withProviderTiming("duffel", "Duffel", async () => {
    const slices = [
      {
        origin: query.origin,
        destination: query.destination,
        departure_date: query.departureDate,
      },
    ];

    if (query.returnDate) {
      slices.push({
        origin: query.destination,
        destination: query.origin,
        departure_date: query.returnDate,
      });
    }

    const response = await fetchWithTimeout(
      "https://api.duffel.com/air/offer_requests",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${process.env.DUFFEL_API_KEY}`,
          "content-type": "application/json",
          "duffel-version": "v2",
        },
        body: JSON.stringify({
          data: {
            slices,
            passengers: Array.from({ length: query.adults }, () => ({ type: "adult" })),
            cabin_class: mapCabin(query.cabin),
            return_offers: true,
          },
        }),
      },
      12_000,
    );

    if (!response.ok) {
      throw new Error(`Duffel Offer Request falhou (${response.status}).`);
    }

    const payload = (await response.json()) as DuffelResponse;
    const results = (payload.data?.offers ?? [])
      .map(normalizeOffer)
      .filter((result): result is SearchResult => result !== null);

    return {
      results,
      message: results.length
        ? `${results.length} ofertas NDC normalizadas.`
        : "Duffel respondeu, mas não retornou ofertas para esta rota.",
    };
  });
}
