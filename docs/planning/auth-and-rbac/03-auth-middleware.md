# Phase 03: Auth Middleware + Permission Matrix

**Status:** ✅ Done
**Depends on:** Phase 01 (auth foundation), Phase 02 (users collection — needed for `getCurrentUser` to look up profile)

## Goal

Build the server-side auth toolkit that Phase 04+ will use: a `getCurrentUser()` helper, a permission matrix mapped from the canonical table in the plan README, and a `withAuth()` wrapper for API route handlers. After this phase, no API routes are protected yet (Phase 04 wires them up), but the toolkit is unit-testable on its own.

## Tasks

- [x] Create `lib/auth/get-current-user.ts`:
  - `import "server-only"`.
  - Read `auth-token` cookie via `cookies()` from `next/headers`.
  - If absent → return `null`.
  - Verify token via `verifyIdToken(token)` from `lib/services/auth`.
  - Look up user in Firestore via `usersRepository.findById(decoded.uid)`.
  - If profile missing OR `status === "disabled"` → return `null`.
  - Cache result in request scope using `React.cache` (so multiple calls in same request reuse one Firestore read). Cache only the success path; null on failure should not be cached.
  - Export `getCurrentUser(): Promise<User | null>` and `requireUser(): Promise<User>` (throws `UnauthorizedError` if null).
- [x] Create `lib/auth/permissions.ts`:
  - Define `Permission` union type matching every action: e.g. `"accounts:read" | "accounts:create" | "accounts:update" | "accounts:delete" | "products:read" | ... | "users:manage" | "uploads:write"`.
  - Define `permissionsByRole: Record<UserRole, Set<Permission>>` matching the matrix in plan README.
  - Export `can(role: UserRole, permission: Permission): boolean` — `permissionsByRole[role].has(permission)`.
  - Export `requirePermission(role, permission)` — throws `ForbiddenError` if not allowed.
  - Export typed errors: `UnauthorizedError` (401, "Anda harus masuk."), `ForbiddenError` (403, "Anda tidak memiliki akses untuk tindakan ini.").
- [x] Create `lib/auth/with-auth.ts`:
  - Export `withAuth(handler, opts)` higher-order function for App Router route handlers.
  - `opts: { permission?: Permission; allowAny?: boolean }` — if `permission` set, requires it; if `allowAny: true`, just requires any logged-in user (no role check).
  - On call: `const user = await getCurrentUser(); if (!user) return 401 + clear cookie; if (opts.permission && !can(user.role, opts.permission)) return 403; return handler(req, ctx, user)`.
  - The wrapped handler signature receives `user` as 3rd arg so route code can use it directly.
- [x] Create `lib/auth/index.ts` — barrel export of all of above + types.
- [x] Add unit tests (optional for MVP, document as future work) — pure functions are easy to test.
- [x] Update project docs.

## Files to Create/Modify

**Create:**
- `lib/auth/get-current-user.ts`
- `lib/auth/permissions.ts`
- `lib/auth/with-auth.ts`
- `lib/auth/index.ts`

**Modify:**
- None — this phase is purely additive.

## Docs to Update

- **`docs/02-architecture.md`**:
  - Folder structure: add `lib/auth/` folder with all files commented.
- **`docs/03-api-data-flow.md`**:
  - Add a new section **"RBAC: protecting API routes"** (after "Authentication flow" section from Phase 01) that shows the `withAuth` pattern with a worked example:
    ```ts
    export const GET = withAuth(async (request, ctx, user) => {
      const data = await listAccounts()
      return Response.json(data)
    }, { permission: "accounts:read" })
    ```
- **`docs/04-conventions.md`**:
  - Add an **"Authorization"** section under "Auth": every API route MUST be wrapped with `withAuth`. Even read-only routes that "everyone" can access should use `{ allowAny: true }` instead of leaving unwrapped — explicit > implicit.

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] `getCurrentUser()` returns valid user when called inside an API route with a valid cookie set.
- [x] `getCurrentUser()` returns `null` when cookie missing, expired, or user disabled.
- [x] `can("kasir", "accounts:read")` → true; `can("kasir", "accounts:delete")` → false (matches matrix).
- [x] `withAuth(handler, { permission: "accounts:delete" })` invoked by Kasir → handler not called, response is 403 with Indonesian error message.
- [x] All docs updated.

## Notes

- **`React.cache` for request-scoped caching:** import from `"react"` — works in server components and route handlers in Next.js 16. Each HTTP request gets its own cache (don't cache across requests). This avoids re-verifying token + re-fetching profile if multiple components/handlers call `getCurrentUser` in the same request.
- **Why permissions as strings (`"accounts:read"`) instead of nested objects?** Strings serialize easily, work in switch statements, are greppable. Object/proxy patterns over-engineer this.
- **Permission naming convention:** `<resource>:<action>` where action is one of `read | create | update | delete` — except special cases like `users:manage` (covers all actions, since user management is admin-only) and `uploads:write` (no read needed).
- **Where `withAuth` lives in the stack:** API route file → `withAuth` wrapper → handler → use case → repository. The wrapper is the auth boundary; everything below it can trust `user` is valid.
- **What about server components?** `app/(dashboard)/layout.tsx` already uses TanStack Query (client-side). For now we don't add server-side auth gates on pages — the API routes are the enforcement layer. If a non-Admin tries to navigate to `/pengaturan/pengguna` (Phase 05), the page loads but the API call inside fails with 403 → UI shows error state. Future improvement: add Next.js `middleware.ts` to redirect-on-page-load based on cookie, but defer to keep this phase focused.
- **Edge case — token expired mid-request:** verifyIdToken throws → `getCurrentUser` catches and returns null. The route returns 401, client TanStack Query catches, redirects to login.
- **No code in API routes changes yet** — Phase 04 does the wholesale wrapping. This phase only ships the toolkit.
