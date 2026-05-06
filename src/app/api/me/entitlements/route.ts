import { NextResponse } from "next/server";
import { getMissingCoreEnv } from "@/lib/env";
import { ensureProfile, getEntitlement } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

  await ensureProfile(supabase, user);

  return NextResponse.json({
    entitlement: await getEntitlement(supabase, user.id),
  });
}
