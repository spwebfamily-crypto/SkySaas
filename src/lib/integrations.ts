export type IntegrationStatus = "configured" | "missing" | "blocked" | "error";

export type IntegrationHealth = {
  id: "supabase" | "stripe" | "amadeus" | "duffel" | "seats";
  name: string;
  description: string;
  status: IntegrationStatus;
  statusLabel: string;
  detail: string;
  env: string[];
  action: string;
};

function hasEvery(keys: string[]) {
  return keys.every((key) => Boolean(process.env[key]));
}

export function getIntegrationHealth(): IntegrationHealth[] {
  const stripeKeys = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRICE_EXPLORER_MONTH",
    "STRIPE_PRICE_EXPLORER_YEAR",
    "STRIPE_PRICE_PRO_MONTH",
    "STRIPE_PRICE_PRO_YEAR",
  ];

  const seatsHasKey = Boolean(process.env.SEATS_AERO_API_KEY);
  const seatsCommercialOk = process.env.SEATS_AERO_COMMERCIAL_OK === "true";

  return [
    {
      id: "supabase",
      name: "Supabase",
      description: "Auth, Postgres, RLS, perfis, uso diário e histórico.",
      status: hasEvery([
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
      ])
        ? "configured"
        : "missing",
      statusLabel: hasEvery([
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
      ])
        ? "Configured"
        : "Missing",
      detail: "Necessário para login, quota e sincronização de assinatura.",
      env: [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
      ],
      action: "Configurar",
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Checkout, portal do cliente e webhooks de assinatura.",
      status: hasEvery(stripeKeys) ? "configured" : "missing",
      statusLabel: hasEvery(stripeKeys) ? "Configured" : "Missing",
      detail: "Use chaves test e Price IDs de assinatura para Explorer e Pro.",
      env: stripeKeys,
      action: "Configurar",
    },
    {
      id: "amadeus",
      name: "Amadeus",
      description: "Flight Offers para tarifas cash em ambiente self-service.",
      status: hasEvery(["AMADEUS_CLIENT_ID", "AMADEUS_CLIENT_SECRET"])
        ? "configured"
        : "missing",
      statusLabel: hasEvery(["AMADEUS_CLIENT_ID", "AMADEUS_CLIENT_SECRET"])
        ? "Configured"
        : "Missing",
      detail: "Sem credenciais, o provider aparece como configuração pendente.",
      env: ["AMADEUS_CLIENT_ID", "AMADEUS_CLIENT_SECRET"],
      action: "Testar",
    },
    {
      id: "duffel",
      name: "Duffel",
      description: "NDC Offer Requests para ofertas cash normalizadas.",
      status: hasEvery(["DUFFEL_API_KEY"]) ? "configured" : "missing",
      statusLabel: hasEvery(["DUFFEL_API_KEY"]) ? "Configured" : "Missing",
      detail: "A chave deve ter acesso ao ambiente Duffel usado pelo app.",
      env: ["DUFFEL_API_KEY"],
      action: "Testar",
    },
    {
      id: "seats",
      name: "Seats.aero",
      description: "Disponibilidade de milhas apenas com autorização comercial.",
      status: seatsHasKey && seatsCommercialOk ? "configured" : seatsHasKey ? "blocked" : "missing",
      statusLabel:
        seatsHasKey && seatsCommercialOk
          ? "Configured"
          : seatsHasKey
            ? "Blocked by compliance"
            : "Missing",
      detail:
        seatsHasKey && seatsCommercialOk
          ? "Modo milhas pode consultar a API."
          : "Defina SEATS_AERO_COMMERCIAL_OK=true somente após autorização comercial.",
      env: ["SEATS_AERO_API_KEY", "SEATS_AERO_COMMERCIAL_OK"],
      action: seatsHasKey && !seatsCommercialOk ? "Solicitar acesso" : "Configurar",
    },
  ];
}
