import Stripe from "stripe";
import { hasStripeEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!hasStripeEnv()) {
    return null;
  }

  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
    appInfo: {
      name: "SkySearch",
      version: "1.0.0",
    },
  });

  return stripeClient;
}
