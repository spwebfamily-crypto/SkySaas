import type { ProviderResult, SearchQuery, SearchResult } from "@/lib/search/types";
import {
  buildBadges,
  fetchWithTimeout,
  missingProvider,
  parseIsoDurationToMinutes,
  scoreResult,
  withProviderTiming,
} from "@/lib/search/utils";

type AmadeusSegment = {
  carrierCode?: string;
  number?: string;
  departure?: { at?: string; iataCode?: string };
  arrival?: { at?: string; iataCode?: string };
};

type AmadeusOffer = {
  id?: string;
  itineraries?: Array<{
    duration?: string;
    segments?: AmadeusSegment[];
  }>;
  price?: {
    total?: string;
    currency?: string;
  };
  travelerPricings?: Array<{
    fareDetailsBySegment?: Array<{
      cabin?: string;
      includedCheckedBags?: { quantity?: number };
    }>;
  }>;
  numberOfBookableSeats?: number;
};

type AmadeusResponse = {
  data?: AmadeusOffer[];
  dictionaries?: {
    carriers?: Record<string, string>;
  };
};

let cachedToken: { token: string; expiresAt: number } | null = null;

const AMADEUS_BASE_URL = "https://test.api.amadeus.com";

function mapCabin(cabin: SearchQuery["cabin"]) {
  const map = {
    economy: "ECONOMY",
    premium_economy: "PREMIUM_ECONOMY",
    business: "BUSINESS",
    first: "FIRST",
  };

  return map[cabin];
}

async function getAmadeusToken() {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais Amadeus não configuradas.");
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const response = await fetchWithTimeout(
    `${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    },
    8000,
  );

  if (!response.ok) {
    throw new Error(`Amadeus OAuth falhou (${response.status}).`);
  }

  const payload = (await response.json()) as { access_token?: string; expires_in?: number };

  if (!payload.access_token) {
    throw new Error("Amadeus não devolveu access token.");
  }

  cachedToken = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 1800) * 1000,
  };

  return cachedToken.token;
}

function normalizeOffer(offer: AmadeusOffer, carriers: Record<string, string>): SearchResult | null {
  const itinerary = offer.itineraries?.[0];
  const firstSegment = itinerary?.segments?.[0];
  const lastSegment = itinerary?.segments?.at(-1);
  const price = Number(offer.price?.total ?? 0);

  if (!firstSegment?.departure?.at || !lastSegment?.arrival?.at || !price) {
    return null;
  }

  const airlineCode = firstSegment.carrierCode ?? "??";
  const durationMin = parseIsoDurationToMinutes(itinerary?.duration);
  const stops = Math.max((itinerary?.segments?.length ?? 1) - 1, 0);
  const cabin =
    offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin?.replace("_", " ") ??
    "ECONOMY";
  const result: SearchResult = {
    id: `amadeus-${offer.id ?? crypto.randomUUID()}`,
    provider: "amadeus",
    source: "Amadeus Flight Offers",
    airline: carriers[airlineCode] ?? airlineCode,
    flightNumber: `${airlineCode}${firstSegment.number ?? ""}`,
    route: `${firstSegment.departure.iataCode ?? "?"} -> ${lastSegment.arrival?.iataCode ?? "?"}`,
    cashPrice: price,
    currency: offer.price?.currency ?? "EUR",
    miles: null,
    taxes: null,
    program: null,
    durationMin,
    stops,
    departure: firstSegment.departure.at,
    arrival: lastSegment.arrival.at,
    cabin,
    bookingUrl: null,
    seatsLeft: offer.numberOfBookableSeats ?? null,
    score: 0,
    badges: [],
  };

  result.score = scoreResult(result);
  result.badges = buildBadges(result);

  return result;
}

export async function searchAmadeus(query: SearchQuery): Promise<ProviderResult> {
  if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) {
    return missingProvider(
      "amadeus",
      "Amadeus",
      "Configure AMADEUS_CLIENT_ID e AMADEUS_CLIENT_SECRET para ativar preços cash.",
    );
  }

  return withProviderTiming("amadeus", "Amadeus", async () => {
    const token = await getAmadeusToken();
    const params = new URLSearchParams({
      originLocationCode: query.origin,
      destinationLocationCode: query.destination,
      departureDate: query.departureDate,
      adults: String(query.adults),
      travelClass: mapCabin(query.cabin),
      currencyCode: "EUR",
      max: "12",
    });

    if (query.returnDate) {
      params.set("returnDate", query.returnDate);
    }

    const response = await fetchWithTimeout(
      `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params.toString()}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
      9000,
    );

    if (!response.ok) {
      throw new Error(`Amadeus Flight Offers falhou (${response.status}).`);
    }

    const payload = (await response.json()) as AmadeusResponse;
    const carriers = payload.dictionaries?.carriers ?? {};
    const results = (payload.data ?? [])
      .map((offer) => normalizeOffer(offer, carriers))
      .filter((result): result is SearchResult => result !== null);

    return {
      results,
      message: results.length
        ? `${results.length} tarifas normalizadas.`
        : "Amadeus respondeu, mas não retornou tarifas para esta rota.",
    };
  });
}
