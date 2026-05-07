"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { plans, type BillingInterval, type PaidPlanId } from "@/lib/plans";

export function PricingCards({
  compact = false,
  currentPlan = "free",
}: {
  compact?: boolean;
  currentPlan?: string;
}) {
  const router = useRouter();
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visiblePlans = plans.filter((plan) => plan.id === "free" || plan.id === "explorer" || plan.id === "pro");

  async function startCheckout(plan: PaidPlanId) {
    setLoadingPlan(plan);
    setError(null);

    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    });

    if (response.status === 401) {
      router.push(`/auth/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    const payload = (await response.json()) as { url?: string; code?: string };

    if (!response.ok || !payload.url) {
      setError(
        payload.code === "PRICE_NOT_CONFIGURED"
          ? "Price ID do Stripe não configurado para este plano."
          : "Não foi possível abrir o checkout agora.",
      );
      setLoadingPlan(null);
      return;
    }

    window.location.assign(payload.url);
  }

  return (
    <section className={`pricing-panel ${compact ? "compact" : ""}`} id="pricing">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Planos</p>
          <h2>Comece com limite diário. Pague quando precisar de volume.</h2>
        </div>
        <div className="billing-toggle" aria-label="Intervalo de cobrança">
          <button
            aria-pressed={interval === "month"}
            className={interval === "month" ? "active" : ""}
            onClick={() => setInterval("month")}
            type="button"
          >
            Mensal
          </button>
          <button
            aria-pressed={interval === "year"}
            className={interval === "year" ? "active" : ""}
            onClick={() => setInterval("year")}
            type="button"
          >
            Anual
          </button>
        </div>
      </div>

      {error && (
        <p aria-live="polite" className="form-message error">
          {error}
        </p>
      )}

      <div className="pricing-grid">
        {visiblePlans.map((plan) => {
          const isCheckoutPlan = plan.id === "explorer" || plan.id === "pro";
          const isCurrent = currentPlan === plan.id;
          const displayPrice =
            interval === "year" && plan.yearlyPrice ? plan.yearlyPrice : plan.monthlyPrice;

          return (
            <article className={`pricing-card ${plan.id === "explorer" ? "featured" : ""}`} key={plan.id}>
              {plan.id === "explorer" && <span className="plan-badge">Mais escolhido</span>}
              <div>
                <span className="plan-name">{plan.name}</span>
                <strong className="plan-price">
                  {displayPrice}
                  {plan.id !== "free" && <small>/{interval === "year" ? "ano" : "mês"}</small>}
                </strong>
              </div>
              <p>
                {plan.dailySearchLimit === null
                  ? "Pesquisas ilimitadas"
                  : `${plan.dailySearchLimit} pesquisas por dia`}
              </p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {isCheckoutPlan ? (
                <button
                  className={plan.id === "explorer" ? "primary-button" : "secondary-button"}
                  disabled={loadingPlan === plan.id || isCurrent}
                  onClick={() => startCheckout(plan.id as PaidPlanId)}
                  type="button"
                >
                  {loadingPlan === plan.id ? <Loader2 className="spin" size={17} /> : null}
                  {isCurrent ? "Plano atual" : "Ativar plano"}
                  <ArrowRight size={17} />
                </button>
              ) : (
                <a className="secondary-button" href="/auth/signup">
                  Começar grátis
                  <ArrowRight size={17} />
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
