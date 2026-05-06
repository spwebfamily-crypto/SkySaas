export const FREE_DAILY_SEARCH_LIMIT = 5;

export type PlanId = "free" | "explorer" | "pro" | "business";
export type BillingInterval = "month" | "year";
export type PaidPlanId = Exclude<PlanId, "free" | "business">;

export type PlanConfig = {
  id: PlanId;
  name: string;
  monthlyPrice: string;
  yearlyPrice?: string;
  dailySearchLimit: number | null;
  apiRequests: string;
  features: string[];
  checkout?: boolean;
};

export const plans: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: "€0",
    dailySearchLimit: FREE_DAILY_SEARCH_LIMIT,
    apiRequests: "Sem API",
    features: [
      "5 pesquisas por dia",
      "Busca cash real quando APIs estiverem configuradas",
      "Resultados com origem e estado do provider",
    ],
  },
  {
    id: "explorer",
    name: "Explorer",
    monthlyPrice: "€7",
    yearlyPrice: "€59",
    dailySearchLimit: null,
    apiRequests: "Sem API pública",
    checkout: true,
    features: [
      "Pesquisas ilimitadas",
      "Histórico de pesquisas",
      "Alertas e calendário flexível",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: "€19",
    yearlyPrice: "€149",
    dailySearchLimit: null,
    apiRequests: "1.000 req/dia",
    checkout: true,
    features: [
      "Tudo do Explorer",
      "Detector de erro tarifário",
      "API e exportação CSV",
    ],
  },
  {
    id: "business",
    name: "Business",
    monthlyPrice: "Custom",
    dailySearchLimit: null,
    apiRequests: "SLA dedicado",
    features: [
      "API ilimitada",
      "Widget white-label",
      "Analytics e suporte dedicado",
    ],
  },
];

export function getPlan(planId: PlanId) {
  return plans.find((plan) => plan.id === planId) ?? plans[0];
}

export function isPaidPlan(planId: PlanId) {
  return planId === "explorer" || planId === "pro" || planId === "business";
}

export function getStripePriceId(plan: PaidPlanId, interval: BillingInterval) {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`;
  return process.env[key];
}

export function getPlanFromStripePrice(priceId: string | null | undefined): PlanId {
  if (!priceId) {
    return "free";
  }

  const entries: Array<[PlanId, string | undefined]> = [
    ["explorer", process.env.STRIPE_PRICE_EXPLORER_MONTH],
    ["explorer", process.env.STRIPE_PRICE_EXPLORER_YEAR],
    ["pro", process.env.STRIPE_PRICE_PRO_MONTH],
    ["pro", process.env.STRIPE_PRICE_PRO_YEAR],
  ];

  return entries.find(([, envPriceId]) => envPriceId === priceId)?.[0] ?? "free";
}
