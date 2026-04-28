# Phase 04: Apply RBAC to Existing API Routes

**Status:** ✅ Done
**Depends on:** Phase 03 (auth middleware), Phase 02 (users API for the `users` routes themselves)

## Goal

Wrap every existing API route handler with `withAuth({ permission })` per the canonical permissions matrix in the plan README. After this phase, the entire API surface enforces auth + role. Anonymous requests get 401, authenticated-but-unauthorized requests get 403, both with Indonesian error messages.

## Tasks

Wrap the following routes. Each item lists: file path → method → permission to use.

- [x] `app/api/accounts/route.ts`
  - GET → `{ permission: "accounts:read" }`
  - POST → `{ permission: "accounts:create" }`
- [x] `app/api/accounts/[id]/route.ts`
  - GET → `{ permission: "accounts:read" }`
  - PATCH → `{ permission: "accounts:update" }`
  - DELETE → `{ permission: "accounts:delete" }`
- [x] `app/api/products/route.ts`
  - GET → `{ permission: "products:read" }`
  - POST → `{ permission: "products:create" }`
- [x] `app/api/products/[id]/route.ts`
  - GET → `{ permission: "products:read" }`
  - PATCH → `{ permission: "products:update" }`
  - DELETE → `{ permission: "products:delete" }`
- [x] `app/api/sales/route.ts`
  - GET → `{ permission: "sales:read" }`
  - POST → `{ permission: "sales:create" }`
- [x] `app/api/sales/[id]/route.ts`
  - GET → `{ permission: "sales:read" }`
  - PATCH → `{ permission: "sales:update" }`
  - DELETE → `{ permission: "sales:delete" }`
- [x] `app/api/purchases/route.ts` + `[id]/route.ts` — same pattern with `purchases:*`
- [x] `app/api/salaries/route.ts` + `[id]/route.ts` — same pattern with `salaries:*`
- [x] `app/api/expenses/route.ts` + `[id]/route.ts` — same pattern with `expenses:*`
- [x] `app/api/unsold-items/route.ts` + `[id]/route.ts` — same pattern with `unsold-items:*` (note: hyphen in permission string)
- [x] `app/api/uploads/route.ts`
  - POST → `{ permission: "uploads:write" }`
- [x] `app/api/reports/period-summary/route.ts` → `{ permission: "reports:read" }`
- [x] `app/api/reports/account-balances/route.ts` → `{ permission: "reports:read" }`
- [x] `app/api/reports/top-products/route.ts` → `{ permission: "reports:read" }`
- [x] `app/api/reports/top-unsold-products/route.ts` → `{ permission: "reports:read" }`
- [x] `app/api/reports/expense-breakdown/route.ts` → `{ permission: "reports:read" }`
- [x] `app/api/users/route.ts` + `[id]/route.ts` + `[id]/reset-password/route.ts` → `{ permission: "users:manage" }`
- [x] `app/api/auth/login/route.ts` → leave unwrapped (login is the entry point — no cookie yet to verify).
- [x] `app/api/auth/me/route.ts` → wrap with `{ allowAny: true }` (just needs a valid logged-in user).
- [x] `app/api/auth/logout/route.ts` → leave unwrapped (clearing cookie is OK even with no/invalid cookie).
- [x] **Add 401 → automatic logout flow on client:** update `lib/fetch/fetch-api.ts` (or wherever `fetchApi` lives) to detect 401 responses and call `queryClient.invalidateQueries({ queryKey: authKeys.me })` so the `useAuth()` hook knows the session is gone → redirects via existing `AuthProvider` logic.
- [x] **Remove `SKIP_AUTH` dev flag** (if Phase 02 added one) — it's a security footgun.
- [x] **Smoke test all roles** — log in as 1 user per role and click around the app:
  - Kasir on `/bahan` → API returns 403 → UI shows error state (Phase 06 will hide menu, this phase just confirms the API blocks).
  - Viewer "Tambah Penjualan" → POST returns 403 → toast shows Indonesian error.
  - Manager attempting to delete account → 403.
  - Admin → no restrictions.
- [x] Update project docs.

## Files to Create/Modify

**Modify (~20 route files):**
- All files listed in tasks above.

**Modify:**
- `lib/fetch/fetch-api.ts` (or equivalent) — handle 401 globally.

## Docs to Update

- **`docs/01-project-context.md`**:
  - **API Routes table:** for each row, append "(Auth: `<permission>`)" or add a new column "Permission". Example: `/api/accounts (POST)` → permission column shows `accounts:create`.
- **`docs/03-api-data-flow.md`**:
  - Update existing examples to show `withAuth(...)` wrapping. The "RBAC" section added in Phase 03 already shows the pattern; here just replace the `accounts/route.ts` worked example with the wrapped version.
- **`docs/04-conventions.md`**:
  - Confirm rule: every new API route must use `withAuth`. Add a paragraph: "If you create a route in `app/api/` without `withAuth`, it's anonymously accessible — that's a security bug. Code review must catch this."

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] `curl http://localhost:3000/api/accounts` (no cookie) returns `401` with `{ error: "Anda harus masuk." }`.
- [x] After login as Kasir, `curl /api/expenses` returns `403` (Kasir has no expense access).
- [x] After login as Admin, all endpoints reachable.
- [x] After login as Viewer, GET endpoints work, all POST/PATCH/DELETE return 403.
- [x] Client app: when API returns 401 mid-session (e.g. token expired), user is auto-logged-out (cleared from `useAuth()`) and login page shown on next nav.
- [x] No regression: smoke test 1 transaction CRUD as Admin to confirm normal flow still works.
- [x] All docs updated.

## Notes

- **Repetitive but mechanical:** ~30 wrappings. Easy to script-edit but reviewing each helps catch off-by-one role mistakes.
- **Why wrap GET endpoints if "everyone can read"?** The matrix shows Viewer can read most things — but Kasir CAN'T read `purchases`, `salaries`, `expenses`, `reports`. Wrapping makes this explicit.
- **`allowAny` for `/api/auth/me`:** the route's purpose is "tell me about myself" — any logged-in user can call it regardless of role. The route handler returns the current user from `getCurrentUser()` (the same one `withAuth` already verified).
- **Login route stays unwrapped:** by design — that's the only entry point that creates the session. Other routes assume session exists.
- **401 vs 403 distinction matters:**
  - 401 = "no valid session" → client clears auth + redirects to login
  - 403 = "valid session, wrong role" → client shows toast/error, does NOT log out
  - The `fetchApi` 401 handler should ONLY trigger logout on 401, not 403.
- **Testing tip:** keep 4 browser profiles open (one per role) using Chrome profiles or different browsers — speeds up smoke testing.
- **Don't refactor route handler internals** — only add the `withAuth` wrapper. Keep the diff focused. Phase 07 will modify use-case calls to add `createdBy` — that's a separate concern.
- **Failure mode to watch:** if `withAuth` is applied to a route but the route handler still tries to read body before the wrapper, things break. Easiest pattern: wrapper does its checks first, then calls handler. The current `withAuth` design (Phase 03) does exactly this — handler only runs after auth passes.
