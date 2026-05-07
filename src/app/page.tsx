import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SkyLogo } from "@/components/brand/sky-logo";
import { PricingCards } from "@/components/pricing/pricing-cards";

const metrics = [
  ["5/dia", "quota Free controlada por conta"],
  ["Stripe", "checkout, portal e webhooks"],
  ["RLS", "dados isolados por usuário"],
];

export default function Home() {
  return (
    <main className="marketing-shell">
      <header className="marketing-nav">
        <Link href="/" aria-label="SkySearch home">
          <SkyLogo />
        </Link>
        <nav aria-label="Navegação pública">
          <Link href="/pricing">Planos</Link>
          <Link href="/auth/login">Login</Link>
          <Link className="nav-cta" href="/auth/signup">
            Começar
          </Link>
        </nav>
      </header>

      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Travel Operations SaaS</p>
          <h1>Busca de voos com login, quota e billing real.</h1>
          <p>
            SkySearch conecta Supabase, Stripe, Amadeus e Duffel para operar pesquisa de
            passagens sem estados falsos. Free tem 5 buscas por dia; pagos pesquisam sem limite.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/auth/signup">
              Criar conta Free
              <ArrowRight size={17} />
            </Link>
            <Link className="secondary-button" href="/auth/login">
              Entrar
            </Link>
          </div>
        </div>

        <ProductPreview />
      </section>

      <section className="operations-strip" aria-label="Capacidades principais">
        {metrics.map(([value, label]) => (
          <div key={value}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
        <div>
          <strong>Compliance</strong>
          <span>milhas bloqueadas até Seats.aero estar autorizado</span>
        </div>
      </section>

      <PricingCards />
    </main>
  );
}

function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Prévia da interface do SkySearch">
      <div className="preview-toolbar">
        <span>Busca</span>
        <span>3 / 5 pesquisas hoje</span>
      </div>
      <div className="preview-form">
        {["LIS", "JFK", "05 jun", "1 adulto"].map((item) => (
          <span key={item}>{item}</span>
        ))}
        <strong>Pesquisar</strong>
      </div>
      <div className="preview-list">
        {[
          ["€421", "LIS - JFK", "Amadeus · 1 escala"],
          ["€438", "LIS - JFK", "Duffel · direto"],
          ["€512", "LIS - JFK", "Provider timeout parcial"],
        ].map(([price, route, meta], index) => (
          <div className="preview-row" key={price}>
            <strong>{price}</strong>
            <span>{route}</span>
            <small>{meta}</small>
            {index === 0 && <CheckCircle2 size={16} />}
          </div>
        ))}
      </div>
    </div>
  );
}
