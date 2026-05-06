import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseBrowserEnv } from "@/lib/env";

export function createClient() {
  if (!hasSupabaseBrowserEnv()) {
    throw new Error("Supabase public env vars are missing.");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
