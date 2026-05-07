import { AppShell } from "@/components/app/app-shell";
import { SearchConsole } from "@/components/app/search-console";
import { SetupRequired } from "@/components/setup-required";
import { getRequiredAppSession } from "@/lib/app-session";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const session = await getRequiredAppSession("/app/search");

  if (!session.configured) {
    return <SetupRequired title="Supabase precisa ser configurado" />;
  }

  return (
    <AppShell active="search" entitlement={session.entitlement} user={session.user}>
      <SearchConsole initialEntitlement={session.entitlement} />
    </AppShell>
  );
}
