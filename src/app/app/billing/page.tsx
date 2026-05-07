import { AppShell } from "@/components/app/app-shell";
import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { SetupRequired } from "@/components/setup-required";
import { getRequiredAppSession } from "@/lib/app-session";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await getRequiredAppSession("/app/billing");

  if (!session.configured) {
    return <SetupRequired title="Supabase precisa ser configurado" />;
  }

  return (
    <AppShell active="billing" entitlement={session.entitlement} user={session.user}>
      <section className="page-heading">
        <div>
          <p className="eyebrow">Billing</p>
          <h1>Plano e assinatura</h1>
        </div>
        <div className="page-heading-actions">
          <p>
            O plano atual é {session.entitlement.plan}. Upgrades usam Stripe Checkout e o portal do
            cliente abre pela API autenticada.
          </p>
          <BillingPortalButton />
        </div>
      </section>
      <PricingCards currentPlan={session.entitlement.plan} compact />
    </AppShell>
  );
}
