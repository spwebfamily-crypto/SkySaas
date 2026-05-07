import { AppShell } from "@/components/app/app-shell";
import { SetupRequired } from "@/components/setup-required";
import { getRequiredAppSession } from "@/lib/app-session";
import { getIntegrationHealth } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const session = await getRequiredAppSession("/app/settings/integrations");

  if (!session.configured) {
    return <SetupRequired title="Supabase precisa ser configurado" />;
  }

  const checkedAt = new Date().toLocaleString("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const integrations = getIntegrationHealth();

  return (
    <AppShell active="settings" entitlement={session.entitlement} user={session.user}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Integrações</p>
          <h1>Saúde do ambiente</h1>
        </div>
        <p>Leitura direta das variáveis do servidor. Última verificação: {checkedAt}.</p>
      </section>

      <section className="integration-panel" aria-label="Estado das integrações">
        {integrations.map((integration) => (
          <article className="integration-row" key={integration.id}>
            <div>
              <strong>{integration.name}</strong>
              <p>{integration.description}</p>
              <small>{integration.detail}</small>
            </div>
            <div className="integration-env">
              {integration.env.map((key) => (
                <code key={key}>{key}</code>
              ))}
            </div>
            <div className="integration-status">
              <span className={`status-pill ${integration.status}`}>{integration.statusLabel}</span>
              <button className="secondary-button" type="button" disabled>
                {integration.action}
              </button>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
