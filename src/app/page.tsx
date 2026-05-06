import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeEuro,
  BellRing,
  Cable,
  Check,
  LockKeyhole,
  Radar,
  ShieldCheck,
} from "lucide-react";
import { SkyLogo } from "@/components/brand/sky-logo";
import { PricingCards } from "@/components/pricing/pricing-cards";

const proof = [
  ["5/dia", "quota grátis controlada por conta"],
  ["Stripe", "Checkout e portal de assinatura"],
  ["RLS", "dados protegidos no Supabase"],
  ["NDC", "Amadeus e Duffel como providers reais"],
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
          <Link href="/login">Login</Link>
          <Link className="nav-cta" href="/signup">
            Começar
          </Link>
        </nav>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">SaaS real de meta-busca aérea</p>
          <h1>Controle voos, milhas, quota e assinatura num cockpit só.</h1>
          <p>
            O SkySearch combina login obrigatório, limite grátis diário,
            assinatura Stripe e providers reais para tirar a busca de passagens
            do mockup.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/signup">
              Criar conta grátis
              <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" href="/login">
              Entrar no app
            </Link>
          </div>
          <div className="proof-strip">
            {proof.map(([value, label]) => (
              <div key={value}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="command-visual" aria-label="Visual do radar SkySearch">
          <Image
            alt="Painel de radar premium com rotas aéreas e métricas de busca"
            fill
            priority
            src="/brand/skysearch-command-asset.svg"
          />
        </div>
      </section>

      <section className="feature-band">
        <article>
          <LockKeyhole size={24} />
          <h2>Login e RLS</h2>
          <p>Supabase Auth, Google OAuth e políticas para isolar dados por usuário.</p>
        </article>
        <article>
          <BadgeEuro size={24} />
          <h2>Billing Stripe</h2>
          <p>Checkout de assinaturas, Customer Portal e webhooks assinados.</p>
        </article>
        <article>
          <Cable size={24} />
          <h2>Providers reais</h2>
          <p>Amadeus e Duffel só retornam dados quando as chaves estão configuradas.</p>
        </article>
        <article>
          <Radar size={24} />
          <h2>Milhas com compliance</h2>
          <p>Seats.aero fica bloqueado até existir autorização comercial explícita.</p>
        </article>
      </section>

      <section className="workflow-section">
        <div>
          <p className="eyebrow">Fluxo operacional</p>
          <h2>Do cadastro ao upgrade sem estados falsos.</h2>
        </div>
        <ol>
          {[
            "Usuário cria conta e recebe 5 pesquisas por dia.",
            "A API valida quota antes de consultar providers.",
            "Stripe libera Explorer ou Pro via webhook.",
            "O app mostra provider, latência, erro ou configuração pendente.",
          ].map((step) => (
            <li key={step}>
              <Check size={17} />
              {step}
            </li>
          ))}
        </ol>
      </section>

      <PricingCards />

      <section className="security-band">
        <ShieldCheck size={22} />
        <span>Sem credenciais, o app não finge busca real. Ele mostra exatamente o que falta configurar.</span>
        <BellRing size={22} />
      </section>
    </main>
  );
}
