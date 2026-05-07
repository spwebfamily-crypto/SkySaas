import Link from "next/link";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { BarChart3, Bell, CreditCard, History, Search, Settings } from "lucide-react";
import { SkyLogo } from "@/components/brand/sky-logo";
import type { Entitlement } from "@/lib/entitlements";

type AppSection = "search" | "history" | "alerts" | "billing" | "settings";

const navItems: Array<{
  href: string;
  label: string;
  section: AppSection;
  icon: typeof Search;
}> = [
  { href: "/app/search", label: "Busca", section: "search", icon: Search },
  { href: "/app/history", label: "Histórico", section: "history", icon: History },
  { href: "/app/alerts", label: "Alertas", section: "alerts", icon: Bell },
  { href: "/app/billing", label: "Billing", section: "billing", icon: CreditCard },
  { href: "/app/settings/integrations", label: "Integrações", section: "settings", icon: Settings },
];

export function AppShell({
  active,
  children,
  entitlement,
  user,
}: {
  active: AppSection;
  children: ReactNode;
  entitlement: Entitlement;
  user: User;
}) {
  const displayName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : user.email ?? "Conta";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="app-brand" href="/app/search" aria-label="SkySearch app">
          <SkyLogo compact />
          <span>SkySearch</span>
        </Link>

        <nav className="app-tabs" aria-label="Navegação do app">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                aria-current={active === item.section ? "page" : undefined}
                className={active === item.section ? "active" : ""}
                href={item.href}
                key={item.href}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="app-header-actions">
          <QuotaBar entitlement={entitlement} />
          <div className="account-chip" title={user.email ?? undefined}>
            <span aria-hidden="true">{initials || "U"}</span>
            <small>{entitlement.plan}</small>
          </div>
          <form action="/auth/signout" method="post">
            <button className="text-button" type="submit">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}

function QuotaBar({ entitlement }: { entitlement: Entitlement }) {
  const unlimited = entitlement.dailySearchLimit === null;
  const used = entitlement.searchesUsedToday;
  const limit = entitlement.dailySearchLimit ?? 1;
  const percent = unlimited ? 100 : Math.min((used / limit) * 100, 100);
  const status = unlimited ? "ok" : percent >= 100 ? "danger" : percent >= 80 ? "warning" : "neutral";

  return (
    <div className={`quota-bar ${status}`} aria-live="polite">
      <div>
        <span>{unlimited ? "Ilimitado" : `${used} / ${limit} pesquisas hoje`}</span>
        <small>{unlimited ? "Plano pago ativo" : `${entitlement.searchesRemainingToday} restantes`}</small>
      </div>
      <span
        aria-label={unlimited ? "Pesquisas ilimitadas" : `${Math.round(percent)}% da quota usada`}
        aria-valuemax={unlimited ? undefined : limit}
        aria-valuemin={unlimited ? undefined : 0}
        aria-valuenow={unlimited ? undefined : used}
        className="quota-track"
        role={unlimited ? undefined : "progressbar"}
      >
        <i style={{ width: `${percent}%` }} />
      </span>
      <BarChart3 size={15} aria-hidden="true" />
    </div>
  );
}
