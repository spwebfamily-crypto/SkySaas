import type { ProviderResult, SearchQuery, SearchResult } from "@/lib/search/types";
import {
  blockedProvider,
  buildBadges,
  fetchWithTimeout,
  scoreResult,
  withProviderTiming,
} from "@/lib/search/utils";

type SeatsRecord = Record<string, unknown>;

function readString(record: SeatsRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return null;
}

function readNumber(record: SeatsRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return null;
}

function mapCabin(cabin: SearchQuery["cabin"]) {
  if (cabin === "premium_economy") {
    return "premium";
  }

  return cabin;
}

function normalizeAward(record: SeatsRecord, query: SearchQuery, index: number): SearchResult {
  const airline = readString(record, ["Airline", "airline", "Carrier", "carrier"]) ?? "Award seat";
  const source = readString(record, ["Source", "source", "Program", "program"]) ?? "Seats.aero";
  const miles =
    readNumber(record, ["MileageCost", "mileage_cost", "miles", "YMileage", "JMileage"]) ??
    0;
  const taxes =
    readNumber(record, ["Taxes", "taxes", "TotalTaxes", "total_taxes", "fees"]) ?? 0;
  const seatsLeft = readNumber(record, ["RemainingSeats", "remaining_seats", "Seats", "seats"]);
  const departure =
    readString(record, ["DepartureDate", "departure_date", "Date", "date"]) ??
    `${query.departureDate}T00:00:00`;
  const flightNumber = readString(record, ["FlightNumber", "flight_number", "Flight", "flight"]) ?? "Award";

  const result: SearchResult = {
    id: `seats-${readString(record, ["ID", "id"]) ?? `${query.origin}-${query.destination}-${index}`}`,
    provider: "seats.aero",
    source,
    airline,
    flightNumber,
    route: `${query.origin} -> ${query.destination}`,
    cashPrice: null,
    currency: "EUR",
    miles,
    taxes,
    program: source,
    durationMin: readNumber(record, ["DurationMinutes", "duration_minutes"]) ?? 0,
    stops: readNumber(record, ["Stops", "stops"]) ?? 0,
    departure,
    arrival: readString(record, ["ArrivalDate", "arrival_date"]) ?? departure,
    cabin: mapCabin(query.cabin),
    bookingUrl: readString(record, ["URL", "url", "BookingURL", "booking_url"]),
    seatsLeft,
    score: 0,
    badges: [],
  };

  result.score = scoreResult(result);
  result.badges = buildBadges(result);

  return result;
}

export async function searchSeatsAero(query: SearchQuery): Promise<ProviderResult> {
  const apiKey = process.env.SEATS_AERO_API_KEY;

  if (process.env.SEATS_AERO_COMMERCIAL_OK !== "true") {
    return blockedProvider(
      "seats.aero",
      "Seats.aero",
      "Milhas bloqueadas: uso comercial requer aprovação explícita da Seats.aero.",
    );
  }

  if (!apiKey) {
    return blockedProvider(
      "seats.aero",
      "Seats.aero",
      "Configure SEATS_AERO_API_KEY depois de obter autorização comercial.",
    );
  }

  return withProviderTiming("seats.aero", "Seats.aero", async () => {
    const params = new URLSearchParams({
      origin_airport: query.origin,
      destination_airport: query.destination,
      start_date: query.departureDate,
      end_date: query.departureDate,
      cabins: mapCabin(query.cabin),
      take: "25",
      order_by: "lowest_mileage",
      include_trips: "false",
    });

    const response = await fetchWithTimeout(
      `https://seats.aero/partnerapi/search?${params.toString()}`,
      {
        headers: {
          "Partner-Authorization": apiKey,
        },
      },
      9000,
    );

    if (!response.ok) {
      throw new Error(`Seats.aero Cached Search falhou (${response.status}).`);
    }

    const payload = (await response.json()) as { data?: SeatsRecord[]; Data?: SeatsRecord[] };
    const rows = payload.data ?? payload.Data ?? [];
    const results = rows.map((row, index) => normalizeAward(row, query, index));

    return {
      results,
      message: results.length
        ? `${results.length} resgates normalizados.`
        : "Seats.aero respondeu sem disponibilidade para esta rota.",
    };
  });
}
