import { NextResponse } from "next/server";
import { z } from "zod";
import { getMissingCoreEnv, getSiteUrl } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripePriceId } from "@/lib/plans";

const checkoutSchema = z.object({
  plan: z.enum(["explorer", "pro"]),
  interval: z.enum(["month", "year"]),
});

export async function POST(request: Request) {
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

  const body = checkoutSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json(
      { code: "INVALID_CHECKOUT_REQUEST", issues: body.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const priceId = getStripePriceId(body.data.plan, body.data.interval);

  if (!priceId) {
    return NextResponse.json(
      { code: "PRICE_NOT_CONFIGURED", plan: body.data.plan, interval: body.data.interval },
      { status: 503 },
    );
  }

  const { data: profile } = await service
    .from("profiles")
    .select("stripe_customer_id,email,full_name")
    .eq("user_id", user.id)
    .maybeSingle<{
      stripe_customer_id: string | null;
      email: string | null;
      full_name: string | null;
    }>();

  let customerId = profile?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      name: profile?.full_name ?? undefined,
      metadata: {
        supabaseUserId: user.id,
      },
    });
    customerId = customer.id;

    await service.from("profiles").upsert(
      {
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
      },
      { onConflict: "user_id" },
    );
  }

  const siteUrl = getSiteUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    success_url: `${siteUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/billing/cancel`,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    metadata: {
      userId: user.id,
      plan: body.data.plan,
      interval: body.data.interval,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        plan: body.data.plan,
        interval: body.data.interval,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
