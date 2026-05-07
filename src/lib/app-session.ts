import { redirect } from "next/navigation";
import { ensureProfile, getEntitlement } from "@/lib/entitlements";
import { hasSupabaseBrowserEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function getRequiredAppSession(nextPath = "/app/search") {
  if (!hasSupabaseBrowserEnv()) {
    return {
      configured: false as const,
      supabase: null,
      user: null,
      entitlement: null,
    };
  }

  const supabase = await createClient();

  if (!supabase) {
    return {
      configured: false as const,
      supabase: null,
      user: null,
      entitlement: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  await ensureProfile(supabase, user);

  return {
    configured: true as const,
    supabase,
    user,
    entitlement: await getEntitlement(supabase, user.id),
  };
}
