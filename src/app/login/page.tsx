import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { SkyLogo } from "@/components/brand/sky-logo";
import { isBypassAuth } from "@/lib/env";
import { Zap } from "lucide-react";

export default function LoginPage() {
  const bypass = isBypassAuth();

  return (
    <main className="auth-screen">
      <Link className="auth-logo-link" href="/">
        <SkyLogo />
      </Link>
      {bypass ? (
        <section className="auth-card">
          <p className="eyebrow">Modo demo</p>
          <h1>Bypass ativo</h1>
          <p className="auth-copy">Auth desativada via <code>BYPASS_AUTH=true</code>. Acesse o dashboard diretamente.</p>
          <Link className="primary-button" href="/app" style={{ marginTop: 24, textDecoration: "none" }}>
            <Zap size={18} />
            Entrar no Dashboard
          </Link>
        </section>
      ) : (
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      )}
    </main>
  );
}
