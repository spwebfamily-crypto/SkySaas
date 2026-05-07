import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function BillingSuccessPage() {
  return (
    <main className="auth-screen">
      <section className="setup-card">
        <CheckCircle2 size={32} />
        <p className="eyebrow">Pagamento recebido</p>
        <h1>Assinatura em processamento</h1>
        <p>
          O Stripe enviará o webhook para ativar o plano. Se o webhook local estiver configurado,
          a quota ilimitada aparece em instantes.
        </p>
        <Link className="primary-button" href="/app/search">
          Voltar à busca
        </Link>
      </section>
    </main>
  );
}
