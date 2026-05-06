"use client";

import { FormEvent, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Gauge,
  Loader2,
  Lock,
  Plane,
  Radar,
  Search,
  Settings,
  Sparkles,
  Zap,
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
  const [state, setState] = useState<"idle" | "loading" | "success" | "error" | "limited">("idle");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [entitlement, setEntitlement] = useState(initialEntitlement);
  const [error, setError] = useState<SearchError | null>(null);

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
      setError(payload as SearchError);
      return;
    }

    if (!response.ok) {
      setState("error");
      setError(payload as SearchError);
      return;
    }

    const data = payload as SearchPayload;
    setResults(data.results);
    setProviders(data.providers);
    setEntitlement(data.entitlement);
    setState("success");
  }

  async function openBillingPortal() {
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const payload = (await response.json()) as { url?: string };

    if (payload.url) {
      window.location.assign(payload.url);
    } else {
      window.location.assign("/pricing");
    }
  }

  const quotaPercent =
    entitlement.dailySearchLimit === null
      ? 100
      : Math.min((entitlement.searchesUsedToday / entitlement.dailySearchLimit) * 100, 100);

  return (
    <main className="app-console">
      <section className="console-hero">
        <div>
          <p className="eyebrow">Aviation Command</p>
          <h1>Radar real de passagens</h1>
          <p>
            Pesquise voos cash com Amadeus e Duffel. Milhas só entram quando a
            autorização comercial da Seats.aero estiver configurada.
          </p>
        </div>
        <div className="quota-tower">
          <div className="quota-ring" style={{ "--quota": `${quotaPercent * 3.6}deg` } as React.CSSProperties}>
            <span>{entitlement.dailySearchLimit === null ? "∞" : entitlement.searchesRemainingToday}</span>
          </div>
          <strong>{entitlement.plan.toUpperCase()}</strong>
          <small>
            {entitlement.dailySearchLimit === null
              ? "Pesquisas ilimitadas"
              : `${entitlement.searchesUsedToday}/${entitlement.dailySearchLimit} usadas hoje`}
          </small>
          <button className="ghost-button" onClick={openBillingPortal} type="button">
            <Settings size={16} />
            Assinatura
          </button>
        </div>
      </section>

      <section className="mission-board">
        <form className="search-module" onSubmit={handleSearch}>
          <div className="module-header">
            <div>
              <p className="eyebrow">Nova missão</p>
              <h2>{origin.toUpperCase()} → {destination.toUpperCase()}</h2>
            </div>
            <div className="mode-switch">
              <button
                className={mode === "cash" ? "active" : ""}
                onClick={() => setMode("cash")}
                type="button"
              >
                Cash
              </button>
              <button
                className={mode === "miles" ? "active" : ""}
                onClick={() => setMode("miles")}
                type="button"
              >
                Milhas
              </button>
            </div>
          </div>

          <div className="search-fields">
            <label>
              <span>Origem</span>
              <input maxLength={3} onChange={(event) => setOrigin(event.target.value)} value={origin} />
            </label>
            <label>
              <span>Destino</span>
              <input maxLength={3} onChange={(event) => setDestination(event.target.value)} value={destination} />
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
            <label>
              <span>Cabine</span>
              <select onChange={(event) => setCabin(event.target.value)} value={cabin}>
                <option value="economy">Económica</option>
                <option value="premium_economy">Premium</option>
                <option value="business">Executiva</option>
                <option value="first">Primeira</option>
              </select>
            </label>
          </div>

          <div className="search-footer">
            <div className="sort-tabs">
              {(["recommended", "price", "duration"] as SortMode[]).map((sortKey) => (
                <button
                  className={sort === sortKey ? "active" : ""}
                  key={sortKey}
                  onClick={() => setSort(sortKey)}
                  type="button"
                >
                  {sortKey === "recommended" ? "Score" : sortKey === "price" ? "Preço" : "Tempo"}
                </button>
              ))}
            </div>
            <button className="primary-button" disabled={state === "loading"} type="submit">
              {state === "loading" ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
              Pesquisar
            </button>
          </div>
        </form>

        <aside className="provider-panel">
          <div className="radar-visual" aria-hidden="true">
            <span />
            <i />
          </div>
          <div className="provider-list">
            {providers.length === 0 ? (
              <>
                <ProviderPlaceholder name="Amadeus" />
                <ProviderPlaceholder name="Duffel" />
                <ProviderPlaceholder name="Seats.aero" />
              </>
            ) : (
              providers.map((provider) => <ProviderRow key={provider.provider} provider={provider} />)
            )}
          </div>
        </aside>
      </section>

      {state === "limited" && (
        <StatusBanner
          icon={Lock}
          title="Limite diário atingido"
          text={`O plano Free permite ${error?.limit ?? 5} pesquisas por dia. Ative Explorer ou Pro para pesquisar sem limite.`}
          actionHref="/pricing"
          actionLabel="Ver planos"
        />
      )}

      {state === "error" && (
        <StatusBanner
          icon={AlertTriangle}
          title="Pesquisa não concluída"
          text={error?.message ?? error?.code ?? "Verifique a configuração e tente novamente."}
          actionHref="/pricing"
          actionLabel="Ver configuração"
        />
      )}

      {state === "loading" && <ResultsSkeleton />}

      {state !== "loading" && state !== "idle" && results.length === 0 && (
        <StatusBanner
          icon={Radar}
          title="Sem resultados normalizados"
          text="Os providers responderam sem disponibilidade ou ainda precisam de credenciais reais."
          actionHref="/app"
          actionLabel="Nova busca"
        />
      )}

      {results.length > 0 && (
        <section className="results-grid" aria-label="Resultados reais">
          {results.map((result, index) => (
            <ResultCard index={index} key={result.id} result={result} />
          ))}
        </section>
      )}
    </main>
  );
}

function ProviderPlaceholder({ name }: { name: string }) {
  return (
    <div className="provider-row muted">
      <span />
      <strong>{name}</strong>
      <small>A aguardar</small>
    </div>
  );
}

function ProviderRow({ provider }: { provider: ProviderStatus }) {
  return (
    <div className={`provider-row ${provider.status}`}>
      <span />
      <strong>{provider.label}</strong>
      <small>{provider.message}</small>
      <em>{provider.latencyMs ? `${provider.latencyMs} ms` : provider.status}</em>
    </div>
  );
}

function ResultCard({ result, index }: { result: SearchResult; index: number }) {
  const price =
    result.cashPrice !== null
      ? moneyFormatter.format(result.cashPrice)
      : result.miles !== null
        ? `${milesFormatter.format(result.miles)} mi`
        : "Sob consulta";

  return (
    <article className="result-card" style={{ "--delay": `${index * 45}ms` } as React.CSSProperties}>
      <div className="result-score">
        <Gauge size={17} />
        {result.score}
      </div>
      <div>
        <p className="eyebrow">{result.source}</p>
        <h3>{result.airline}</h3>
        <div className="route-line">
          <span>{result.route}</span>
          <Plane size={15} />
          <span>{result.stops === 0 ? "Direto" : `${result.stops} escala`}</span>
        </div>
      </div>
      <div className="result-details">
        <span>{new Date(result.departure).toLocaleString("pt-PT", { dateStyle: "medium", timeStyle: "short" })}</span>
        <span>{result.durationMin ? `${Math.floor(result.durationMin / 60)}h ${result.durationMin % 60}m` : "Duração não informada"}</span>
        <span>{result.cabin}</span>
      </div>
      <div className="result-bottom">
        <strong>{price}</strong>
        <div className="badge-row">
          {result.badges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
      </div>
      {result.bookingUrl && (
        <a className="result-link" href={result.bookingUrl} rel="noreferrer" target="_blank">
          Abrir provider <ArrowUpRight size={15} />
        </a>
      )}
    </article>
  );
}

function ResultsSkeleton() {
  return (
    <section className="results-grid" aria-label="A carregar resultados">
      {[0, 1, 2].map((item) => (
        <div className="result-card skeleton" key={item}>
          <span />
          <i />
          <b />
        </div>
      ))}
    </section>
  );
}

function StatusBanner({
  actionHref,
  actionLabel,
  icon: Icon,
  text,
  title,
}: {
  actionHref: string;
  actionLabel: string;
  icon: typeof Sparkles;
  text: string;
  title: string;
}) {
  return (
    <section className="status-banner">
      <Icon size={24} />
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      <a className="secondary-button" href={actionHref}>
        {actionLabel}
        <Zap size={16} />
      </a>
    </section>
  );
}
