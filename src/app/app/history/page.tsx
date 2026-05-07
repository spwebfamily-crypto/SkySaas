import { AppShell } from "@/components/app/app-shell";
import { SetupRequired } from "@/components/setup-required";
import { getRequiredAppSession } from "@/lib/app-session";

type HistoryRow = {
  id: string;
  created_at: string;
  mode: string;
  query: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
  };
  result_count: number;
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await getRequiredAppSession("/app/history");

  if (!session.configured) {
    return <SetupRequired title="Supabase precisa ser configurado" />;
  }

  const { data } = await session.supabase
    .from("search_history")
    .select("id,created_at,mode,query,result_count")
    .order("created_at", { ascending: false })
    .limit(20);
  const rows = (data ?? []) as HistoryRow[];

  return (
    <AppShell active="history" entitlement={session.entitlement} user={session.user}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Histórico</p>
          <h1>Pesquisas recentes</h1>
        </div>
        <p>As últimas buscas ficam associadas à sua conta e respeitam RLS no Supabase.</p>
      </section>

      <section className="table-panel" aria-label="Histórico de pesquisas">
        {rows.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhuma pesquisa registrada.</strong>
            <p>Faça uma busca em /app/search para criar o primeiro registro.</p>
          </div>
        ) : (
          <div className="data-table">
            <div className="data-row header">
              <span>Rota</span>
              <span>Data da viagem</span>
              <span>Modo</span>
              <span>Resultados</span>
              <span>Criada em</span>
            </div>
            {rows.map((row) => (
              <div className="data-row" key={row.id}>
                <strong>
                  {(row.query.origin ?? "???").toUpperCase()} -{" "}
                  {(row.query.destination ?? "???").toUpperCase()}
                </strong>
                <span>{row.query.departureDate ?? "Sem data"}</span>
                <span>{row.mode === "miles" ? "Milhas" : "Cash"}</span>
                <span>{row.result_count}</span>
                <span>{new Date(row.created_at).toLocaleString("pt-PT")}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
