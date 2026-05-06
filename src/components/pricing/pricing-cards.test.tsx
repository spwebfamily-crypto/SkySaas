import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PricingCards } from "@/components/pricing/pricing-cards";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("PricingCards", () => {
  afterEach(cleanup);

  it("renders free and paid SaaS plans", () => {
    render(<PricingCards currentPlan="free" />);

    expect(screen.queryByText("Free")).not.toBeNull();
    expect(screen.queryByText("Explorer")).not.toBeNull();
    expect(screen.queryByText("Pro")).not.toBeNull();
    expect(screen.queryByText("Business")).not.toBeNull();
  });
});
