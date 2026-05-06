import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchConsole } from "@/components/app/search-console";
import { SkyLogo } from "@/components/brand/sky-logo";
import { SetupRequired } from "@/components/setup-required";
import { ensureProfile, getEntitlement } from "@/lib/entitlements";
import { hasSupabaseBrowserEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  if (!hasSupabaseBrowserEnv()) {
    return <SetupRequired title="Supabase precisa ser configurado" />;
  }

  const supabase = await createClient();

  if (!supabase) {
    return <SetupRequired title="Supabase precisa ser configurado" />;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/app");
  }

  await ensureProfile(supabase, user);
  const entitlement = await getEntitlement(supabase, user.id);

  return (
    <>
      <header className="app-nav">
        <Link href="/app" aria-label="SkySearch app">
          <SkyLogo />
        </Link>
        <nav aria-label="Navegação do app">
          <Link href="/pricing">Planos</Link>
          <form action="/auth/signout" method="post">
            <button className="ghost-button" type="submit">
              Sair
            </button>
          </form>
        </nav>
      </header>
      <SearchConsole initialEntitlement={entitlement} />
    </>
  );
}
