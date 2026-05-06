import { AlertTriangle } from "lucide-react";
import { getMissingCoreEnv } from "@/lib/env";

export function SetupRequired({ title = "Configuração necessária" }: { title?: string }) {
  const missing = getMissingCoreEnv();

  return (
    <main className="auth-screen">
      <section className="setup-card">
        <AlertTriangle size={28} />
        <p className="eyebrow">SkySearch setup</p>
        <h1>{title}</h1>
        <p>
          Configure Supabase e Stripe no `.env.local` para ativar login, quota e
          pagamentos reais.
        </p>
        <div className="missing-env-list">
          {missing.map((key) => (
            <code key={key}>{key}</code>
          ))}
        </div>
      </section>
    </main>
  );
}
