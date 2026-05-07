import { NextResponse } from "next/server";
import { getMissingCoreEnv, getSiteUrl } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST() {
  const stripe = getStripe();
  const supabase = await createClient();
  const service = createServiceClient();

  if (!stripe || !supabase || !service) {
    return NextResponse.json(
      {
        code: "CONFIGURATION_REQUIRED",
        missing: getMissingCoreEnv(),
      },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ code: "AUTH_REQUIRED" }, { status: 401 });
  }

  const { data: profile } = await service
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle<{ stripe_customer_id: string | null }>();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { code: "NO_STRIPE_CUSTOMER", message: "Crie uma assinatura antes de abrir o portal." },
      { status: 404 },
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${getSiteUrl()}/app/billing`,
  });

  return NextResponse.json({ url: session.url });
}
