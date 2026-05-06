import Link from "next/link";
import { SkyLogo } from "@/components/brand/sky-logo";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { getEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const entitlement = user && supabase ? await getEntitlement(supabase, user.id) : null;

  return (
    <main className="marketing-shell">
      <header className="marketing-nav">
        <Link href="/" aria-label="SkySearch home">
          <SkyLogo />
        </Link>
        <nav aria-label="Navegação pública">
          <Link href="/app">App</Link>
          <Link href={user ? "/app" : "/login"}>{user ? "Cockpit" : "Login"}</Link>
        </nav>
      </header>
      <section className="pricing-hero">
        <p className="eyebrow">Assinatura real</p>
        <h1>Stripe Checkout para planos Explorer e Pro.</h1>
        <p>
          Free começa com quota diária. Planos pagos sincronizam via webhook e
          liberam pesquisas ilimitadas automaticamente.
        </p>
      </section>
      <PricingCards currentPlan={entitlement?.plan} />
    </main>
  );
}
