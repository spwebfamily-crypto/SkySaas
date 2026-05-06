import { describe, expect, it } from "vitest";
import {
  assertCanSearch,
  buildEntitlement,
  resolvePlanFromSubscription,
} from "@/lib/entitlements";

describe("entitlements", () => {
  it("allows free users while they are under the daily limit", () => {
    const entitlement = buildEntitlement("free", "free", 4);

    expect(entitlement.canSearch).toBe(true);
    expect(entitlement.searchesRemainingToday).toBe(1);
    expect(assertCanSearch(entitlement).ok).toBe(true);
  });

  it("blocks free users when the daily limit is reached", () => {
    const entitlement = buildEntitlement("free", "free", 5);
    const check = assertCanSearch(entitlement);

    expect(entitlement.canSearch).toBe(false);
    expect(check.ok).toBe(false);
    expect(check.ok ? null : check.status).toBe(402);
  });

  it("keeps paid users unlimited", () => {
    const entitlement = buildEntitlement("pro", "active", 932);

    expect(entitlement.canSearch).toBe(true);
    expect(entitlement.dailySearchLimit).toBeNull();
    expect(entitlement.features.apiAccess).toBe(true);
  });

  it("falls back to free when subscription is expired", () => {
    const resolved = resolvePlanFromSubscription({
      plan: "explorer",
      status: "active",
      current_period_end: "2020-01-01T00:00:00.000Z",
    });

    expect(resolved.plan).toBe("free");
    expect(resolved.status).toBe("expired");
  });
});
