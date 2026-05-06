import { afterEach, describe, expect, it, vi } from "vitest";
import { getPlanFromStripePrice, getStripePriceId } from "@/lib/plans";

describe("plans", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("maps checkout plans to Stripe price ids", () => {
    vi.stubEnv("STRIPE_PRICE_EXPLORER_MONTH", "price_explorer_month");

    expect(getStripePriceId("explorer", "month")).toBe("price_explorer_month");
  });

  it("maps Stripe price ids back to plans", () => {
    vi.stubEnv("STRIPE_PRICE_PRO_YEAR", "price_pro_year");

    expect(getPlanFromStripePrice("price_pro_year")).toBe("pro");
    expect(getPlanFromStripePrice("unknown")).toBe("free");
  });
});
