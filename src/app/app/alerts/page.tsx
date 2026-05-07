import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { SetupRequired } from "@/components/setup-required";
import { getRequiredAppSession } from "@/lib/app-session";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const session = await getRequiredAppSession("/app/alerts");

  if (!session.configured) {
    return <SetupRequired title="Supabase precisa ser configurado" />;
  }

  return (
    <AppShell active="alerts" entitlement={session.entitlement} user={session.user}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Alertas</p>
          <h1>Monitoramento de preços</h1>
        </div>
        <p>Alertas entram na próxima fase após a base real de busca e billing estar configurada.</p>
      </section>

      <section className="empty-state bordered">
        <strong>Sem alertas ativos.</strong>
        <p>
          Crie uma busca primeiro. Quando houver resultado real, o app poderá salvar critérios de
          preço e avisar quando a rota baixar.
        </p>
        <Link className="secondary-button" href="/app/search">
          Criar busca
        </Link>
      </section>
    </AppShell>
  );
}
