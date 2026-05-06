import { searchAmadeus } from "@/lib/search/amadeus";
import { searchDuffel } from "@/lib/search/duffel";
import { searchSeatsAero } from "@/lib/search/seats";
import type { ProviderResult, SearchQuery } from "@/lib/search/types";
import { sortResults } from "@/lib/search/utils";

export async function runSearch(query: SearchQuery) {
  const providers: Array<Promise<ProviderResult>> =
    query.mode === "miles"
      ? [searchSeatsAero(query)]
      : [searchAmadeus(query), searchDuffel(query)];

  const providerResults = await Promise.all(providers);
  const results = sortResults(
    providerResults.flatMap((result) => result.results),
    query.sort,
  );

  return {
    results,
    providers: providerResults.map((result) => result.status),
  };
}
