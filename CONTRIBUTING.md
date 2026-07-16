# Contributing

## Branching & commits

- Branch names: `feature/short-description`, `fix/short-description`, `chore/short-description`.
- Open a PR against `main`. CI must pass (lint, typecheck, unit tests, migration lint, build,
  E2E) before merge.
- Merges to `main` trigger the deploy pipeline (`.github/workflows/deploy.yml`) — treat
  `main` as production.

## Coding standards

- **TypeScript strict mode is non-negotiable.** No `any` without an inline comment
  explaining why. `noUncheckedIndexedAccess` is on — handle the `undefined` case.
- **Business logic lives in `lib/services/`**, never inline inside a page component or a
  route handler. Pages/actions call services; they don't reimplement them.
- **Validation is single-sourced.** Add or change a Zod schema in `lib/validation/`, and
  both the client form and the server action/route import it — never duplicate a rule.
- **Every data-fetching component needs loading, error, and empty states.** No bare
  spinners with no fallback, no silent empty arrays rendered as blank space.
- **Feature gating always goes through `lib/entitlements/`.** Never write
  `if (profile.plan === 'pro')` inline — call `hasFeature(entitlement, 'gallery')` (or
  add a new flag to the seeded `plans.feature_flags` if genuinely new) so gating logic
  stays in one place.
- **Card ownership binding is never a raw `UPDATE`.** Any change to `cards.owner_user_id`
  or activation state must go through the `activate_card` / `freeze_card` RPCs.
- **Accessibility:** semantic HTML, visible keyboard focus (don't remove default outlines
  without replacing them), ARIA labels on icon-only buttons, color contrast at WCAG AA.

## Naming conventions

| Context | Convention | Example |
|---|---|---|
| Database tables/columns | `snake_case` | `org_members`, `owner_user_id` |
| Foreign keys | `{referenced_table_singular}_id` | `organization_id`, `profile_id` |
| TypeScript types/components | `PascalCase` | `ProfileHeader`, `Entitlement` |
| Variables/functions | `camelCase` | `getSeatUsage`, `isProOrAbove` |
| Constants | `SCREAMING_SNAKE_CASE` | `RATE_LIMITS`, `STATUS_STYLES` |
| Files | `kebab-case` | `lead-status-select.tsx` |
| API routes | REST-ish, resource-based, no verbs | `/api/leads/export` |
| Branches | `type/description` | `feature/employee-bulk-invite` |

## Adding a migration

```bash
npm run supabase:migrate:new add_some_table
```

Migrations are additive/backward-compatible by default (expand-contract pattern): add new
columns as nullable or with defaults, and never drop a column in the same PR that stops
writing to it — ship the code change first, drop the column in a follow-up migration once
you're confident nothing reads it.

Every new table needs:
1. `enable row level security`
2. At least one policy (or an explicit comment explaining why it's intentionally
   inaccessible via the client, as with `payment_events`)
3. An entry in `packages/types/src/database.types.ts`

## Adding a new plan feature flag

1. Add the flag to the relevant plan(s) in a new migration (`update public.plans set
   feature_flags = feature_flags || '{"new_flag": true}'::jsonb where tier = '...'`).
2. Add the flag name to the `FeatureFlag` union in `lib/entitlements/index.ts`.
3. Gate the UI/action with `hasFeature(entitlement, 'new_flag')` — never a raw tier string
   comparison.

## Testing expectations

- New business logic in `lib/services/` needs a unit test in the adjacent `__tests__/`
  folder.
- New Zod schemas need at least one passing and one failing case.
- A new critical user-facing flow (anything touching money, card activation, or auth)
  should get a Playwright E2E test in `e2e/`.
