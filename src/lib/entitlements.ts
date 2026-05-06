import type { SupabaseClient, User } from "@supabase/supabase-js";
import { FREE_DAILY_SEARCH_LIMIT, getPlan, isPaidPlan, type PlanId } from "@/lib/plans";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export type Entitlement = {
  plan: PlanId;
  status: string;
  dailySearchLimit: number | null;
  searchesUsedToday: number;
  searchesRemainingToday: number | null;
  canSearch: boolean;
  features: {
    unlimitedSearch: boolean;
    alerts: boolean;
    apiAccess: boolean;
    milesSearch: boolean;
  };
};

type SubscriptionRow = {
  plan: PlanId;
  status: string;
  current_period_end: string | null;
};

type UsageRow = {
  count: number;
};

export function getUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function buildEntitlement(plan: PlanId, status: string, searchesUsedToday: number) {
  const planConfig = getPlan(plan);
  const dailySearchLimit = planConfig.dailySearchLimit;
  const unlimitedSearch = dailySearchLimit === null;
  const searchesRemainingToday = unlimitedSearch
    ? null
    : Math.max(dailySearchLimit - searchesUsedToday, 0);

  return {
    plan,
    status,
    dailySearchLimit,
    searchesUsedToday,
    searchesRemainingToday,
    canSearch: unlimitedSearch || searchesUsedToday < dailySearchLimit,
    features: {
      unlimitedSearch,
      alerts: isPaidPlan(plan),
      apiAccess: plan === "pro" || plan === "business",
      milesSearch: true,
    },
  } satisfies Entitlement;
}

export function resolvePlanFromSubscription(subscription: SubscriptionRow | null) {
  if (!subscription || !ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
    return { plan: "free" as PlanId, status: "free" };
  }

  if (
    subscription.current_period_end &&
    new Date(subscription.current_period_end).getTime() < Date.now()
  ) {
    return { plan: "free" as PlanId, status: "expired" };
  }

  return { plan: subscription.plan, status: subscription.status };
}

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
) {
  const metadata = user.user_metadata ?? {};

  await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      email: user.email,
      full_name:
        typeof metadata.full_name === "string"
          ? metadata.full_name
          : typeof metadata.name === "string"
            ? metadata.name
            : null,
      avatar_url: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    },
    { onConflict: "user_id" },
  );
}

export async function getEntitlement(
  supabase: SupabaseClient,
  userId: string,
  dateKey = getUtcDateKey(),
) {
  const [{ data: subscription }, { data: usage }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan,status,current_period_end")
      .eq("user_id", userId)
      .in("status", Array.from(ACTIVE_SUBSCRIPTION_STATUSES))
      .order("current_period_end", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle<SubscriptionRow>(),
    supabase
      .from("search_usage")
      .select("count")
      .eq("user_id", userId)
      .eq("usage_date", dateKey)
      .maybeSingle<UsageRow>(),
  ]);

  const resolved = resolvePlanFromSubscription(subscription ?? null);
  return buildEntitlement(
    resolved.plan,
    resolved.status,
    Math.max(usage?.count ?? 0, 0),
  );
}

export function assertCanSearch(entitlement: Entitlement) {
  if (!entitlement.canSearch && entitlement.dailySearchLimit !== null) {
    return {
      ok: false as const,
      status: 402,
      body: {
        code: "SEARCH_LIMIT_REACHED",
        limit: FREE_DAILY_SEARCH_LIMIT,
        plan: entitlement.plan,
      },
    };
  }

  return { ok: true as const };
}

export async function incrementSearchUsage(
  supabase: SupabaseClient,
  userId: string,
  dateKey = getUtcDateKey(),
) {
  const { data, error } = await supabase.rpc("increment_search_usage", {
    target_date: dateKey,
  });

  if (!error && data && typeof data === "object" && "count" in data) {
    return Number(data.count);
  }

  const { data: existing } = await supabase
    .from("search_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("usage_date", dateKey)
    .maybeSingle<UsageRow>();

  const nextCount = (existing?.count ?? 0) + 1;

  await supabase.from("search_usage").upsert(
    {
      user_id: userId,
      usage_date: dateKey,
      count: nextCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,usage_date" },
  );

  return nextCount;
}
