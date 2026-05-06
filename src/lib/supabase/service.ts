import { createClient } from "@supabase/supabase-js";
import { hasSupabaseServiceEnv } from "@/lib/env";

export function createServiceClient() {
  if (!hasSupabaseServiceEnv()) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
