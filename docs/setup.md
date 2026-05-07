# SkySearch Setup

Este projeto está pronto para rodar como SaaS real em modo local ou Vercel, mas depende de serviços externos configurados.

## 1. Ambiente

1. Instale dependências com `npm install`.
2. Copie `.env.example` para `.env.local`.
3. Mantenha chaves reais fora do git.

## 2. Supabase

1. Crie um projeto Supabase.
2. Copie `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`.
3. Rode a migração `supabase/migrations/001_saas_core.sql` no SQL Editor ou via Supabase CLI.
4. Ative Email/Password em Authentication.
5. Para Google OAuth, configure o provider no Supabase e adicione `http://127.0.0.1:3000/auth/callback` aos redirect URLs.

## 3. Stripe

1. Use Stripe em modo test.
2. Crie dois produtos recorrentes: Explorer e Pro.
3. Crie preços mensal/anual e preencha:
   - `STRIPE_PRICE_EXPLORER_MONTH`
   - `STRIPE_PRICE_EXPLORER_YEAR`
   - `STRIPE_PRICE_PRO_MONTH`
   - `STRIPE_PRICE_PRO_YEAR`
4. Configure o webhook para `/api/webhooks/stripe`.
5. Escute eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`.
6. Use `4242 4242 4242 4242` para testar checkout.

## 4. Providers

1. Amadeus: crie uma app Self-Service e preencha `AMADEUS_CLIENT_ID` e `AMADEUS_CLIENT_SECRET`.
2. Duffel: crie uma API key e preencha `DUFFEL_API_KEY`.
3. Seats.aero: preencha `SEATS_AERO_API_KEY` somente se tiver acesso comercial. Defina `SEATS_AERO_COMMERCIAL_OK=true` apenas depois da autorização.

## 5. Validação

Rode:

```bash
npm run lint
npm run build
npm test
npm audit --omit=dev
```

Depois faça os cenários manuais:

1. Usuário Free pesquisa 5 vezes e recebe bloqueio na sexta tentativa.
2. Upgrade Explorer abre Stripe Checkout.
3. Webhook ativa plano ilimitado no Supabase.
4. `/app/settings/integrations` mostra providers configurados, pendentes ou bloqueados.
5. Modo milhas permanece bloqueado sem autorização comercial Seats.aero.
