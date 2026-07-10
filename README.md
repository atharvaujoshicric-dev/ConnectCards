# Connect Cards

Premium NFC-powered digital identity platform — metal business cards backed by a full
digital profile, CRM lead capture, organization management, and subscription SaaS.

This repository is the complete production application: marketing site, authentication,
card activation, public profiles, dashboard (profile/theme/analytics/leads/orders/billing),
organization & employee management, admin console, Supabase backend (schema, RLS, Edge
Functions), and tests.

For product/architecture decisions and rationale, see the project blueprint shared
alongside this repo — this README covers **running and operating the code**.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui patterns |
| Backend | Supabase (Postgres, Auth, Storage, Realtime, Edge Functions) |
| Payments | Razorpay (primary, India), Stripe (secondary/international + subscriptions) |
| Email | Resend + React Email |
| Testing | Vitest + Testing Library (unit/component), Playwright (E2E) |
| Deployment | Vercel (app) + Supabase (database/functions), GitHub Actions (CI/CD) |

---

## Getting started

### Prerequisites

- Node.js 20.11+ (see `.nvmrc`)
- Docker (for local Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli) `>=1.226`

### 1. Install dependencies

```bash
npm install
```

### 2. Start Supabase locally

```bash
npm run supabase:start
```

This spins up local Postgres, Auth, Storage, and Studio (http://localhost:54323), applies
all migrations in `supabase/migrations`, and seeds sample data from `supabase/seed.sql`.

Local Auth emails (OTP codes) land in Inbucket at **http://localhost:54324** — there is no
real email sending in local dev unless you configure `RESEND_API_KEY`.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values printed by `supabase start` (API URL, anon key, service role key) plus
any payment/email provider keys you want to test against. Sensible local defaults exist for
everything else.

### 4. Run the app

```bash
npm run dev
```

Visit **http://localhost:3000**.

### Seeded test accounts (local only)

| Email | Role |
|---|---|
| `founder@connectcards.app` | Super admin (`/admin`) |
| `jane.doe@example.com` | Individual, Pro plan, published profile at `/jane-doe` |
| `admin@acme-corp.com` | Owner of "Acme Corp" organization |

All seeded users use password `devpassword123` for local convenience — production auth is
passwordless Email OTP only; this seed password only exists to make local Supabase Studio
inspection easier and is never used by the app's real login flow.

---

## Project structure

```
app/                    Next.js App Router routes
  (marketing)/           Public marketing site (landing, pricing, about, contact, themes, legal)
  (auth)/                 Login/signup (Email OTP)
  (dashboard)/            Authenticated user dashboard
  (admin)/                 Super-admin console
  a/[token]/              Card activation
  [slug]/                  Public profile pages
  org/new/                 Organization creation
  order/                   Card ordering + checkout
  api/                     Route handlers (webhooks proxy, leads export, health)
components/             React components, grouped by feature area
lib/
  supabase/               Browser/server/middleware Supabase clients
  services/               Business logic (orders, leads, cards, analytics, organizations, subscriptions)
  validation/             Zod schemas (shared client+server)
  entitlements/           Feature-gating (reads the `entitlements` DB view)
  security/               Rate limiting, API response envelope
emails/                 React Email templates
supabase/
  migrations/             SQL migrations (schema, RLS, functions) — run in filename order
  functions/              Edge Functions (webhooks, cron jobs)
  seed.sql                Local dev seed data
e2e/                    Playwright end-to-end tests
```

---

## Database & migrations

Migrations live in `supabase/migrations/`, named with a timestamp prefix so they always
apply in order. To create a new one:

```bash
npm run supabase:migrate:new <description>
```

Apply pending migrations locally:

```bash
npm run supabase:migrate:up
```

Regenerate TypeScript types from the live schema (kept in sync with the hand-maintained
`packages/types/src/database.types.ts`, which CI checks against):

```bash
npm run supabase:gen:types
```

**Row Level Security is the source of truth for authorization.** Every table has RLS
enabled; see `20260101000011` through `20260101000014` for the full policy set, plus
`SECURITY DEFINER` functions (`activate_card`, `freeze_card`, `get_card_by_token`,
`record_analytics_event`) that safely expose narrow, specific operations to
unauthenticated visitors without granting broad table access.

---

## Edge Functions

| Function | Purpose | Trigger |
|---|---|---|
| `razorpay-webhook` | Payment/subscription events from Razorpay | Razorpay webhook |
| `stripe-webhook` | Payment/subscription events from Stripe | Stripe webhook |
| `analytics-rollup` | Aggregates prior day's raw events into daily rollups | Scheduled (nightly) |
| `notification-dispatch` | Single fan-out point for in-app + email notifications | Internal call |
| `generate-brochure` | Generates a PDF brochure for Pro+ profiles | On-demand |

Deploy all functions:

```bash
supabase functions deploy razorpay-webhook
supabase functions deploy stripe-webhook
supabase functions deploy analytics-rollup
supabase functions deploy notification-dispatch
supabase functions deploy generate-brochure
```

Set secrets for each function's environment (webhook secrets, Resend key, etc.) via
`supabase secrets set`.

---

## Testing

```bash
npm run test              # unit/component tests (watch mode: npm run test:watch)
npm run test:coverage     # with coverage thresholds enforced (see vitest.config.ts)
npm run test:e2e          # Playwright end-to-end tests (builds and serves the app first)
npm run test:e2e:ui       # Playwright's interactive UI mode
```

E2E tests assume the local Supabase instance is running and seeded (`npm run supabase:reset`
if you need a clean slate).

---

## Code quality

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run format        # Prettier (writes)
npm run format:check  # Prettier (check only, used in CI)
```

Husky + lint-staged run lint/format automatically on commit.

---

## Deployment

CI (`.github/workflows/ci.yml`) runs on every PR: lint, typecheck, unit tests, a Supabase
migration lint, a production build, and a Chromium E2E pass.

Deploy (`.github/workflows/deploy.yml`) runs on merge to `main`: applies pending Supabase
migrations, deploys Edge Functions, deploys the Next.js app to Vercel, then runs a
post-deploy smoke test against `/api/health` and the card activation route.

Required GitHub Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `VERCEL_TOKEN`,
`VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, plus the runtime env vars listed in `.env.example` for
build-time checks.

---

## Security notes

- Card ownership binding is **never** a raw client-side `UPDATE` — it goes exclusively
  through the `activate_card` SECURITY DEFINER function, which enforces one-time activation
  at the database layer regardless of what the application code does.
- The service-role Supabase client (`createServiceRoleClient` in `lib/supabase/server.ts`)
  bypasses RLS entirely and must never be imported into client-reachable code paths.
- Rate limiting (`lib/security/rate-limit.ts`) is applied to OTP requests, lead form
  submissions, and the public analytics event RPC to prevent abuse.
- All payment webhooks verify provider signatures before processing and are idempotent via
  a unique `(provider, provider_event_id)` constraint on `payment_events`.
