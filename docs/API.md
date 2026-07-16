# API Reference

Connect Cards' primary interface is server-rendered pages and Server Actions, not a
traditional REST API. The routes below are the exceptions: places where a plain HTTP
endpoint is the right shape (webhooks, file downloads, third-party integration).

All JSON-returning routes use a consistent envelope (see `lib/security/api-response.ts`):

```json
{ "data": { ... }, "error": null }
```

or, on failure:

```json
{ "data": null, "error": { "code": "plan_upgrade_required", "message": "..." } }
```

Error codes: `validation_failed` (422), `unauthorized` (401), `forbidden` (403),
`not_found` (404), `conflict` (409), `rate_limited` (429), `plan_upgrade_required` (402),
`internal_error` (500).

---

## `GET /api/health`

Liveness/readiness check used by the deploy pipeline's smoke test. Verifies database
connectivity by querying the `plans` table.

**Response:** `{ data: { status: "ok", timestamp: "..." } }`

---

## `POST /api/checkout/razorpay`

Creates a Razorpay order for an existing pending card order and returns the details needed
to open Razorpay Checkout client-side.

**Auth:** required (session cookie). The order must belong to the requesting user and be
in `pending_payment` status.

**Body:** `{ "orderId": "uuid" }`

**Response:** `{ data: { orderId, amount, currency, keyId } }`

---

## `GET /api/leads/export`

Exports all leads for the current user's profile as CSV. Requires the `crm_export`
entitlement (Business plan or above).

**Auth:** required. **Query params:** `status` (optional) — filter by lead status
(`new`/`contacted`/`qualified`/`converted`/`lost`).

**Response:** `text/csv` file download, not the standard JSON envelope.

---

## `GET /[slug]/vcf`

Downloads a `.vcf` contact card for a published profile. Publicly accessible (no auth) —
this is the "Save contact" button on every public profile page. Also records a
`vcf_download` analytics event.

**Response:** `text/vcard` file download.

---

## Supabase Edge Functions (webhooks, not called from the Next.js app directly)

These are configured as webhook endpoints in the Razorpay/Stripe dashboards, and as
scheduled/internal calls — they are not part of the public API surface.

| Function | Auth | Purpose |
|---|---|---|
| `razorpay-webhook` | HMAC signature (`x-razorpay-signature`) | Payment/subscription state updates |
| `stripe-webhook` | HMAC signature (`stripe-signature`) | Payment/subscription state updates |
| `analytics-rollup` | `x-cron-secret` header | Nightly aggregation job |
| `notification-dispatch` | `x-internal-secret` header | In-app + email notification fan-out |
| `generate-brochure` | Supabase session JWT | On-demand PDF generation for Pro+ profiles |

---

## Database RPCs (called via the Supabase client, not raw HTTP)

These are `SECURITY DEFINER` Postgres functions exposed through PostgREST/the Supabase
client, used where an operation needs to be available to anonymous visitors without
granting broad table access:

- **`activate_card(p_activation_token, p_user_id)`** — the only way a card's ownership can
  ever be bound. One-time; rejects re-activation of an already-claimed card.
- **`freeze_card(p_card_id, p_reason)`** — freezes a card (owner or org admin only, checked
  inside the function).
- **`get_card_by_token(p_activation_token)`** — public lookup used by the activation page;
  returns only status/color/bound-profile-slug, never the full row.
- **`record_analytics_event(...)`** — public event recording, rate-limited at the
  application layer in addition to this RPC.

---

## Future: Enterprise public API (Phase 3, not yet implemented)

The blueprint reserves `/api/v1/*` for a versioned, `api_keys`-authenticated REST surface
for Enterprise customers (read profiles, read/write leads). The `api_keys` table and scope
model already exist in the schema; the route handlers are not yet built.
