import { afterEach, describe, expect, it, vi } from "vitest";
import { searchAmadeus } from "@/lib/search/amadeus";
import { searchDuffel } from "@/lib/search/duffel";
import { searchSeatsAero } from "@/lib/search/seats";
import { sortResults } from "@/lib/search/utils";
import type { SearchQuery, SearchResult } from "@/lib/search/types";

const query: SearchQuery = {
  origin: "LIS",
  destination: "JFK",
  departureDate: "2026-06-05",
  adults: 1,
  cabin: "economy",
  mode: "cash",
  sort: "recommended",
};

describe("search providers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports missing Amadeus credentials instead of returning fake data", async () => {
    vi.stubEnv("AMADEUS_CLIENT_ID", "");
    vi.stubEnv("AMADEUS_CLIENT_SECRET", "");

    const response = await searchAmadeus(query);

    expect(response.status.status).toBe("missing_config");
    expect(response.results).toHaveLength(0);
  });

  it("reports missing Duffel credentials instead of returning fake data", async () => {
    vi.stubEnv("DUFFEL_API_KEY", "");

    const response = await searchDuffel(query);

    expect(response.status.status).toBe("missing_config");
    expect(response.results).toHaveLength(0);
  });

  it("blocks Seats.aero unless commercial approval is explicit", async () => {
    vi.stubEnv("SEATS_AERO_COMMERCIAL_OK", "false");

    const response = await searchSeatsAero({ ...query, mode: "miles" });

    expect(response.status.status).toBe("blocked");
    expect(response.status.message).toContain("aprovação explícita");
  });

  it("sorts results by price and duration", () => {
    const base: SearchResult = {
      id: "one",
      provider: "amadeus",
      source: "test",
      airline: "A",
      flightNumber: "A1",
      route: "LIS -> JFK",
      cashPrice: 500,
      currency: "EUR",
      miles: null,
      taxes: null,
      program: null,
      durationMin: 600,
      stops: 1,
      departure: "2026-06-05T10:00:00",
      arrival: "2026-06-05T18:00:00",
      cabin: "economy",
      bookingUrl: null,
      seatsLeft: null,
      score: 80,
      badges: [],
    };

    expect(sortResults([base, { ...base, id: "two", cashPrice: 300 }], "price")[0].id).toBe(
      "two",
    );
    expect(
      sortResults([base, { ...base, id: "three", durationMin: 420 }], "duration")[0].id,
    ).toBe("three");
  });
});
