import Link from "next/link";
import { CircleSlash } from "lucide-react";

export default function BillingCancelPage() {
  return (
    <main className="auth-screen">
      <section className="setup-card">
        <CircleSlash size={32} />
        <p className="eyebrow">Checkout cancelado</p>
        <h1>Nenhuma cobrança foi criada</h1>
        <p>Continue no plano Free ou escolha outro plano quando quiser.</p>
        <Link className="primary-button" href="/pricing">
          Ver planos
        </Link>
      </section>
    </main>
  );
}
