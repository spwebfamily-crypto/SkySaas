import { NextResponse } from "next/server";
import { getMissingCoreEnv } from "@/lib/env";
import {
  assertCanSearch,
  buildEntitlement,
  ensureProfile,
  getEntitlement,
  getUtcDateKey,
  incrementSearchUsage,
} from "@/lib/entitlements";
import { runSearch } from "@/lib/search/engine";
import { searchRequestSchema } from "@/lib/search/schema";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
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

  const body = searchRequestSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json(
      { code: "INVALID_SEARCH_REQUEST", issues: body.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  await ensureProfile(supabase, user);

  const dateKey = getUtcDateKey();
  const entitlement = await getEntitlement(supabase, user.id, dateKey);
  const limitCheck = assertCanSearch(entitlement);

  if (!limitCheck.ok) {
    return NextResponse.json(limitCheck.body, { status: limitCheck.status });
  }

  const nextCount = await incrementSearchUsage(supabase, user.id, dateKey);
  const searchResponse = await runSearch(body.data);
  const updatedEntitlement = buildEntitlement(
    entitlement.plan,
    entitlement.status,
    nextCount,
  );

  await supabase.from("search_history").insert({
    user_id: user.id,
    mode: body.data.mode,
    query: body.data,
    provider_status: searchResponse.providers,
    result_count: searchResponse.results.length,
  });

  return NextResponse.json({
    results: searchResponse.results,
    usage: {
      date: dateKey,
      used: updatedEntitlement.searchesUsedToday,
      limit: updatedEntitlement.dailySearchLimit,
      remaining: updatedEntitlement.searchesRemainingToday,
    },
    entitlement: updatedEntitlement,
    providers: searchResponse.providers,
  });
}
