import type { ProviderResult, ProviderStatus, SearchResult, SortMode } from "@/lib/search/types";

export function parseIsoDurationToMinutes(duration: string | null | undefined) {
  if (!duration) {
    return 0;
  }

  const match = duration.match(/P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?/);

  if (!match) {
    return 0;
  }

  return Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
}

export function minutesBetween(start: string, end: string) {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return 0;
  }

  return Math.max(Math.round((endMs - startMs) / 60000), 0);
}

export function scoreResult(input: {
  cashPrice: number | null;
  miles: number | null;
  durationMin: number;
  stops: number;
  seatsLeft: number | null;
}) {
  const priceSignal =
    input.cashPrice !== null
      ? Math.max(0, 40 - input.cashPrice / 25)
      : input.miles !== null
        ? Math.max(0, 40 - input.miles / 2500)
        : 15;
  const durationSignal = Math.max(0, 28 - input.durationMin / 45);
  const stopSignal = input.stops === 0 ? 16 : input.stops === 1 ? 9 : 3;
  const scarcitySignal = input.seatsLeft !== null && input.seatsLeft <= 3 ? 8 : 4;

  return Math.min(Math.round(priceSignal + durationSignal + stopSignal + scarcitySignal + 22), 99);
}

export function buildBadges(result: SearchResult) {
  const badges: string[] = [];

  if (result.score >= 90) {
    badges.push("Melhor custo-benefício");
  }

  if (result.stops === 0) {
    badges.push("Sem escalas");
  }

  if (result.provider === "seats.aero") {
    badges.push("Milhas");
  }

  if (result.seatsLeft !== null && result.seatsLeft <= 3) {
    badges.push("Últimos lugares");
  }

  if (result.durationMin > 0 && result.durationMin <= 540) {
    badges.push("Rápido");
  }

  return badges.length > 0 ? badges : ["Fonte real"];
}

export async function withProviderTiming(
  provider: ProviderStatus["provider"],
  label: string,
  run: () => Promise<Omit<ProviderResult, "status"> & { message?: string }>,
) {
  const start = Date.now();

  try {
    const response = await run();

    return {
      status: {
        provider,
        label,
        status: "ok",
        latencyMs: Date.now() - start,
        message: response.message ?? "Provider respondeu com sucesso.",
      },
      results: response.results,
    } satisfies ProviderResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha inesperada no provider.";
    const status = message.toLowerCase().includes("timeout") ? "timeout" : "error";

    return {
      status: {
        provider,
        label,
        status,
        latencyMs: Date.now() - start,
        message,
      },
      results: [],
    } satisfies ProviderResult;
  }
}

export function missingProvider(provider: ProviderStatus["provider"], label: string, message: string) {
  return {
    status: {
      provider,
      label,
      status: "missing_config",
      latencyMs: 0,
      message,
    },
    results: [],
  } satisfies ProviderResult;
}

export function blockedProvider(provider: ProviderStatus["provider"], label: string, message: string) {
  return {
    status: {
      provider,
      label,
      status: "blocked",
      latencyMs: 0,
      message,
    },
    results: [],
  } satisfies ProviderResult;
}

export async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = 8000,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Timeout ao consultar provider.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function sortResults(results: SearchResult[], sort: SortMode) {
  return [...results].sort((a, b) => {
    if (sort === "price") {
      const aPrice = a.cashPrice ?? a.miles ?? Number.MAX_SAFE_INTEGER;
      const bPrice = b.cashPrice ?? b.miles ?? Number.MAX_SAFE_INTEGER;
      return aPrice - bPrice;
    }

    if (sort === "duration") {
      return a.durationMin - b.durationMin;
    }

    return b.score - a.score;
  });
}
