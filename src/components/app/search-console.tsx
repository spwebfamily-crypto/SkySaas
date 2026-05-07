"use client";

import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { Entitlement } from "@/lib/entitlements";
import type { ProviderStatus, SearchMode, SearchResult, SortMode } from "@/lib/search/types";

const moneyFormatter = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const milesFormatter = new Intl.NumberFormat("pt-PT");

type SearchPayload = {
  results: SearchResult[];
  usage: {
    date: string;
    used: number;
    limit: number | null;
    remaining: number | null;
  };
  entitlement: Entitlement;
  providers: ProviderStatus[];
};

type SearchError = {
  code: string;
  message?: string;
  limit?: number;
  plan?: string;
};

export function SearchConsole({ initialEntitlement }: { initialEntitlement: Entitlement }) {
  const [origin, setOrigin] = useState("LIS");
  const [destination, setDestination] = useState("JFK");
  const [departureDate, setDepartureDate] = useState("2026-06-05");
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState("economy");
  const [mode, setMode] = useState<SearchMode>("cash");
  const [sort, setSort] = useState<SortMode>("recommended");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error" | "limited">("idle");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [entitlement, setEntitlement] = useState(initialEntitlement);
  const [error, setError] = useState<SearchError | null>(null);

  const routeLabel = useMemo(
    () => `${origin.toUpperCase()} - ${destination.toUpperCase()}`,
    [destination, origin],
  );

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setError(null);

    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        origin,
        destination,
        departureDate,
        returnDate,
        adults,
        cabin,
        mode,
        sort,
      }),
    });

    const payload = (await response.json()) as SearchPayload | SearchError;

    if (response.status === 402) {
      setState("limited");
      setResults([]);
      setError(payload as SearchError);
      return;
    }

    if (!response.ok) {
      setState("error");
      setResults([]);
      setError(payload as SearchError);
      return;
    }

    const data = payload as SearchPayload;
    setResults(data.results);
    setProviders(data.providers);
    setEntitlement(data.entitlement);
    setState("success");
  }

  const providerIssues = providers.filter((provider) => provider.status !== "ok");
  const limitReached = state === "limited" || entitlement.canSearch === false;

  return (
    <div className="search-workspace">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Busca</p>
          <h1>Encontre opções reais sem perder o estado da quota.</h1>
        </div>
        <p>
          Cash consulta Amadeus e Duffel. Milhas só funciona quando Seats.aero estiver autorizado
          comercialmente no ambiente.
        </p>
      </section>

      <form className="search-console" onSubmit={handleSearch}>
        <div className="search-line" aria-label="Parâmetros principais">
          <label>
            <span>Origem</span>
            <input
              autoCapitalize="characters"
              maxLength={3}
              onChange={(event) => setOrigin(event.target.value)}
              value={origin}
            />
          </label>
          <label>
            <span>Destino</span>
            <input
              autoCapitalize="characters"
              maxLength={3}
              onChange={(event) => setDestination(event.target.value)}
              value={destination}
            />
          </label>
          <label>
            <span>Ida</span>
            <input onChange={(event) => setDepartureDate(event.target.value)} type="date" value={departureDate} />
          </label>
          <label>
            <span>Volta</span>
            <input onChange={(event) => setReturnDate(event.target.value)} type="date" value={returnDate} />
          </label>
          <label>
            <span>Adultos</span>
            <select onChange={(event) => setAdults(Number(event.target.value))} value={adults}>
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-button" disabled={state === "loading" || limitReached} type="submit">
            {state === "loading" ? <Loader2 className="spin" size={17} /> : <Search size={17} />}
            Pesquisar
          </button>
        </div>

        <div className="search-meta">
          <strong>{routeLabel}</strong>
          <span>{mode === "cash" ? "Cash" : "Milhas"}</span>
          <button
            aria-expanded={showAdvanced}
            className="text-button"
            onClick={() => setShowAdvanced((current) => !current)}
            type="button"
          >
            <SlidersHorizontal size={16} />
            Filtros
            <ChevronDown className={showAdvanced ? "rotate" : ""} size={16} />
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-panel">
            <fieldset>
              <legend>Modo</legend>
              <div className="segmented-control">
                <button
                  aria-pressed={mode === "cash"}
                  className={mode === "cash" ? "active" : ""}
                  onClick={() => setMode("cash")}
                  type="button"
                >
                  Cash
                </button>
                <button
                  aria-pressed={mode === "miles"}
                  className={mode === "miles" ? "active" : ""}
                  onClick={() => setMode("miles")}
                  type="button"
                >
                  Milhas
                </button>
              </div>
              {mode === "miles" && (
                <p className="field-note">
                  Seats.aero exige chave de API e confirmação comercial antes de consultar milhas.
                </p>
              )}
            </fieldset>

            <label>
              <span>Cabine</span>
              <select onChange={(event) => setCabin(event.target.value)} value={cabin}>
                <option value="economy">Econômica</option>
                <option value="premium_economy">Premium economy</option>
                <option value="business">Executiva</option>
                <option value="first">Primeira</option>
              </select>
            </label>

            <fieldset>
              <legend>Ordenar por</legend>
              <div className="segmented-control">
                {(["recommended", "price", "duration"] as SortMode[]).map((sortKey) => (
                  <button
                    aria-pressed={sort === sortKey}
                    className={sort === sortKey ? "active" : ""}
                    key={sortKey}
                    onClick={() => setSort(sortKey)}
                    type="button"
                  >
                    {sortKey === "recommended" ? "Score" : sortKey === "price" ? "Preço" : "Tempo"}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </form>

      {limitReached && (
        <InlineCallout
          actionHref="/pricing"
          actionLabel="Ver planos"
          tone="danger"
          title="Limite diário atingido"
        >
          O plano Free permite {error?.limit ?? entitlement.dailySearchLimit ?? 5} pesquisas por dia.
          Explorer e Pro liberam pesquisa ilimitada.
        </InlineCallout>
      )}

      {state === "error" && (
        <InlineCallout
          actionHref="/app/settings/integrations"
          actionLabel="Ver integrações"
          tone="warning"
          title="Pesquisa não concluída"
        >
          {error?.message ?? error?.code ?? "Verifique a configuração do ambiente e tente novamente."}
        </InlineCallout>
      )}

      {providerIssues.length > 0 && <ProviderIssues providers={providerIssues} />}

      <section className="results-panel" aria-busy={state === "loading"} aria-live="polite">
        <div className="results-heading">
          <div>
            <p className="eyebrow">Resultados</p>
            <h2>{state === "success" ? `${results.length} opções normalizadas` : "Lista de ofertas"}</h2>
          </div>
          <span>{state === "loading" ? "A consultar providers" : sortLabel(sort)}</span>
        </div>

        {state === "loading" && <ResultsSkeleton />}

        {state === "idle" && (
          <div className="empty-state">
            <strong>Pronto para pesquisar.</strong>
            <p>Insira a rota e use Pesquisar. Os resultados aparecerão em linhas comparáveis.</p>
          </div>
        )}

        {state !== "loading" && state !== "idle" && results.length === 0 && (
          <div className="empty-state">
            <strong>Sem resultados normalizados.</strong>
            <p>
              Tente outra data, remova filtros ou confira se os providers estão configurados em
              Integrações.
            </p>
            <a className="secondary-button" href="/app/settings/integrations">
              Ver integrações
              <ArrowRight size={16} />
            </a>
          </div>
        )}

        {results.length > 0 && (
          <div className="result-list">
            {results.map((result, index) => (
              <ResultRow index={index} key={result.id} result={result} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProviderIssues({ providers }: { providers: ProviderStatus[] }) {
  return (
    <section className="provider-notices" aria-label="Estado dos providers">
      {providers.map((provider) => (
        <article className="provider-notice" key={provider.provider}>
          <AlertTriangle size={17} />
          <div>
            <strong>{provider.label}</strong>
            <p>{provider.message}</p>
          </div>
          <a href="/app/settings/integrations">Integrações</a>
        </article>
      ))}
    </section>
  );
}

function ResultRow({ result, index }: { result: SearchResult; index: number }) {
  const price =
    result.cashPrice !== null
      ? moneyFormatter.format(result.cashPrice)
      : result.miles !== null
        ? `${milesFormatter.format(result.miles)} mi`
        : "Sob consulta";
  const hasStrongScore = result.score >= 88;
  const priceTone = hasStrongScore ? "good" : result.score < 55 ? "warning" : "neutral";

  return (
    <article className="result-row" style={{ "--delay": `${index * 35}ms` } as CSSProperties}>
      <div className={`result-price ${priceTone}`}>
        <strong>{price}</strong>
        <span>{priceTone === "good" ? "Bom score" : priceTone === "warning" ? "Revise" : "Tarifa"}</span>
      </div>

      <div className="result-main">
        <div>
          <strong>{result.airline}</strong>
          <span>
            {result.route} · {result.flightNumber || result.source}
          </span>
        </div>
        <div className="result-times">
          <span>{formatDateTime(result.departure)}</span>
          <span>{formatDuration(result.durationMin)}</span>
          <span>{result.stops === 0 ? "Direto" : `${result.stops} escala${result.stops > 1 ? "s" : ""}`}</span>
        </div>
      </div>

      <div className="result-side">
        <span className="provider-tag">{result.source}</span>
        <span>Score {result.score}</span>
        {result.badges.length > 0 && <small>{result.badges.slice(0, 2).join(" · ")}</small>}
      </div>

      <div className="row-actions">
        {result.bookingUrl ? (
          <a href={result.bookingUrl} rel="noreferrer" target="_blank">
            Abrir
            <ArrowUpRight size={15} />
          </a>
        ) : (
          <span>Sem link direto</span>
        )}
      </div>
    </article>
  );
}

function ResultsSkeleton() {
  return (
    <div className="result-list" aria-label="A carregar resultados">
      {[0, 1, 2, 3].map((item) => (
        <div className="result-row skeleton" key={item}>
          <span />
          <i />
          <b />
        </div>
      ))}
    </div>
  );
}

function InlineCallout({
  actionHref,
  actionLabel,
  children,
  title,
  tone,
}: {
  actionHref: string;
  actionLabel: string;
  children: ReactNode;
  title: string;
  tone: "warning" | "danger";
}) {
  return (
    <section className={`inline-callout ${tone}`} role="status">
      <AlertTriangle size={18} />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
      <a href={actionHref}>
        {actionLabel}
        <ArrowRight size={15} />
      </a>
    </section>
  );
}

function sortLabel(sort: SortMode) {
  if (sort === "price") {
    return "Menor preço";
  }
  if (sort === "duration") {
    return "Menor duração";
  }
  return "Recomendado";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDuration(minutes: number) {
  if (!minutes) {
    return "Duração não informada";
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${remaining}m`;
}
