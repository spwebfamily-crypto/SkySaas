"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { plans, type BillingInterval, type PaidPlanId } from "@/lib/plans";

export function PricingCards({ currentPlan = "free" }: { currentPlan?: string }) {
  const router = useRouter();
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: PaidPlanId) {
    setLoadingPlan(plan);
    setError(null);

    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan, interval }),
    });

    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent("/pricing")}`);
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
    <section className="pricing-panel" id="pricing">
      <div className="section-heading">
        <p className="eyebrow">Planos</p>
        <h2>Comece grátis. Pague quando precisar de escala.</h2>
        <div className="billing-toggle" aria-label="Intervalo de cobrança">
          <button
            className={interval === "month" ? "active" : ""}
            onClick={() => setInterval("month")}
            type="button"
          >
            Mensal
          </button>
          <button
            className={interval === "year" ? "active" : ""}
            onClick={() => setInterval("year")}
            type="button"
          >
            Anual
          </button>
        </div>
      </div>

      {error && <p className="form-message error">{error}</p>}

      <div className="pricing-grid">
        {plans.map((plan) => {
          const isCheckoutPlan = plan.id === "explorer" || plan.id === "pro";
          const isCurrent = currentPlan === plan.id;
          const displayPrice =
            interval === "year" && plan.yearlyPrice ? plan.yearlyPrice : plan.monthlyPrice;

          return (
            <article className={`pricing-card ${plan.id === "explorer" ? "featured" : ""}`} key={plan.id}>
              <div>
                <span className="plan-name">{plan.name}</span>
                <strong className="plan-price">
                  {displayPrice}
                  {plan.id !== "business" && plan.id !== "free" && (
                    <small>/{interval === "year" ? "ano" : "mês"}</small>
                  )}
                </strong>
              </div>
              <p>
                {plan.dailySearchLimit === null
                  ? "Pesquisas ilimitadas"
                  : `${plan.dailySearchLimit} pesquisas por dia`}
              </p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              {isCheckoutPlan ? (
                <button
                  className="secondary-button"
                  disabled={loadingPlan === plan.id || isCurrent}
                  onClick={() => startCheckout(plan.id as PaidPlanId)}
                  type="button"
                >
                  {loadingPlan === plan.id ? <Loader2 className="spin" size={17} /> : null}
                  {isCurrent ? "Plano atual" : "Ativar plano"}
                  <ChevronRight size={17} />
                </button>
              ) : (
                <a className="secondary-button" href={plan.id === "business" ? "mailto:sales@skysearch.local" : "/signup"}>
                  {plan.id === "business" ? "Falar com vendas" : "Começar grátis"}
                  <ChevronRight size={17} />
                </a>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
