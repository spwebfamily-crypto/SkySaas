export type SearchMode = "cash" | "miles";
export type SortMode = "recommended" | "price" | "duration";
export type Cabin = "economy" | "premium_economy" | "business" | "first";

export type SearchQuery = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabin: Cabin;
  mode: SearchMode;
  sort: SortMode;
};

export type SearchResult = {
  id: string;
  provider: "amadeus" | "duffel" | "seats.aero";
  source: string;
  airline: string;
  flightNumber: string;
  route: string;
  cashPrice: number | null;
  currency: string;
  miles: number | null;
  taxes: number | null;
  program: string | null;
  durationMin: number;
  stops: number;
  departure: string;
  arrival: string;
  cabin: string;
  bookingUrl: string | null;
  seatsLeft: number | null;
  score: number;
  badges: string[];
};

export type ProviderStatus = {
  provider: "amadeus" | "duffel" | "seats.aero";
  label: string;
  status: "ok" | "missing_config" | "blocked" | "error" | "timeout";
  latencyMs: number;
  message: string;
};

export type ProviderResult = {
  status: ProviderStatus;
  results: SearchResult[];
};
