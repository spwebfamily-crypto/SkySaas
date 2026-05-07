import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { SetupRequired } from "@/components/setup-required";
import { getRequiredAppSession } from "@/lib/app-session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getRequiredAppSession("/app/settings");

  if (!session.configured) {
    return <SetupRequired title="Supabase precisa ser configurado" />;
  }

  return (
    <AppShell active="settings" entitlement={session.entitlement} user={session.user}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Definições</p>
          <h1>Conta e ambiente</h1>
        </div>
        <p>Gerencie os pontos que tornam o SaaS operacional em produção.</p>
      </section>

      <section className="settings-list">
        <Link href="/app/settings/integrations">
          <strong>Integrações</strong>
          <span>Supabase, Stripe, Amadeus, Duffel e Seats.aero</span>
        </Link>
        <Link href="/app/billing">
          <strong>Assinatura</strong>
          <span>Plano atual, checkout e portal do cliente</span>
        </Link>
      </section>
    </AppShell>
  );
}
