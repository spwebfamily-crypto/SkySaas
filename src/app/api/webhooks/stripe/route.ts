import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getPlanFromStripePrice, type PlanId } from "@/lib/plans";
import { getStripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!customer) {
    return null;
  }

  return typeof customer === "string" ? customer : customer.id;
}

async function getUserIdForCustomer(customerId: string) {
  const service = createServiceClient();

  if (!service) {
    return null;
  }

  const { data } = await service
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle<{ user_id: string }>();

  return data?.user_id ?? null;
}

async function upsertSubscription(subscription: Stripe.Subscription) {
  const service = createServiceClient();

  if (!service) {
    return;
  }

  const customerId = getCustomerId(subscription.customer);

  if (!customerId) {
    return;
  }

  const priceId = subscription.items.data[0]?.price.id ?? null;
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end ?? null;
  const metadataPlan = subscription.metadata.plan as PlanId | undefined;
  const plan =
    metadataPlan && ["explorer", "pro", "business"].includes(metadataPlan)
      ? metadataPlan
      : getPlanFromStripePrice(priceId);
  const userId = subscription.metadata.userId ?? (await getUserIdForCustomer(customerId));

  if (!userId) {
    return;
  }

  await service.from("profiles").update({ stripe_customer_id: customerId }).eq("user_id", userId);

  await service.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan,
      status: subscription.status,
      current_period_end:
        typeof currentPeriodEnd === "number"
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function resolveSubscription(input: string | Stripe.Subscription | null) {
  const stripe = getStripe();

  if (!stripe || !input) {
    return null;
  }

  return typeof input === "string" ? stripe.subscriptions.retrieve(input) : input;
}

function readInvoiceSubscription(invoice: Stripe.Invoice) {
  const value = (invoice as unknown as { subscription?: string | { id: string } })
    .subscription;

  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const service = createServiceClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !service || !webhookSecret) {
    return NextResponse.json({ code: "CONFIGURATION_REQUIRED" }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ code: "MISSING_STRIPE_SIGNATURE" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ code: "INVALID_STRIPE_SIGNATURE" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["subscription"],
      });
      await upsertSubscription(
        (await resolveSubscription(fullSession.subscription as string | Stripe.Subscription | null)) ??
          (fullSession.subscription as Stripe.Subscription),
      );
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await upsertSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const subscriptionId = readInvoiceSubscription(event.data.object as Stripe.Invoice);
      const subscription = await resolveSubscription(subscriptionId);
      if (subscription) {
        await upsertSubscription(subscription);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
