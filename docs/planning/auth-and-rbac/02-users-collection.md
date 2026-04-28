# Phase 02: Users Collection (types + repo + use cases + API)

**Status:** ✅ Done
**Depends on:** Phase 01 (Firebase Auth foundation)

## Goal

Build the `users` resource end-to-end so users can be CRUD'd programmatically (still no UI yet — Phase 05). `createUser` use case atomically creates a Firebase Auth account + Firestore profile. `deleteUser` cleans up both. After this phase, the API can fully manage users (the manual seed from Phase 01 is no longer needed for new users — you'd use `POST /api/users` instead).

## Tasks

- [x] Create `types/users.ts`:
  - `UserRole = "admin" | "manager" | "kasir" | "viewer"`
  - `UserStatus = "active" | "disabled"`
  - `User extends BaseEntity` — already defined skeleton in Phase 01; ensure final shape: `{ id (Firebase UID), email, displayName, role, status, mustChangePassword, lastLoginAt? }`
  - `CreateUserPayload` — Zod: email (valid format), displayName (min 2 max 80), password (min 8), role, status (default "active")
  - `UpdateUserPayload` — partial of CreatePayload minus password (password change is separate flow)
  - `userRoleLabels: Record<UserRole, string>` — Indonesian labels: Admin, Manajer, Kasir, Hanya Lihat
- [x] Create `lib/repositories/users/index.ts`:
  - `UsersRepository extends BaseRepository<User>` — collection `"users"`.
  - **Override `create`** to accept a custom doc ID (Firebase UID) instead of auto-generating, since Firestore doc ID must match Firebase Auth UID. Add `createWithId(id, data)` method.
  - `findByEmail(email)` helper.
- [x] Create `lib/use-cases/users/create-user.ts`:
  - Validate payload via Zod.
  - Call `getAuth(getFirebaseApp()).createUser({ email, password, displayName, disabled: status === "disabled" })` to create Firebase Auth account → returns UID.
  - Call `usersRepository.createWithId(uid, { email, displayName, role, status, mustChangePassword: true })` to create Firestore profile.
  - On Firestore failure, **rollback** by deleting the just-created Firebase Auth user. Document the failure handling in JSDoc.
  - Throw `UserAlreadyExistsError` if email collision (catch Firebase `auth/email-already-exists`).
- [x] Create `lib/use-cases/users/list-users.ts` — `usersRepository.findAll({ orderBy: { field: "createdAt", direction: "desc" } })`.
- [x] Create `lib/use-cases/users/get-user.ts` — `findById` + `UserNotFoundError`.
- [x] Create `lib/use-cases/users/update-user.ts`:
  - Validate via Zod.
  - Update Firebase Auth: if `displayName` changed → `getAuth().updateUser(uid, { displayName })`; if `status` changed to `"disabled"` → `getAuth().updateUser(uid, { disabled: true })` (and revoke refresh tokens to immediately log them out).
  - Update Firestore profile.
- [x] Create `lib/use-cases/users/delete-user.ts`:
  - Block deletion if `id === currentUserId` (admin can't delete themselves). Throw `CannotDeleteSelfError`.
  - Block deletion if this is the only Admin (so the system always has at least 1 admin). Throw `LastAdminError`.
  - Delete Firestore profile first, then `getAuth().deleteUser(uid)`. If Firebase deletion fails (network, etc.), profile is already gone — log warning, return success since the user can no longer log in (no profile = blocked at login).
- [x] Create `lib/use-cases/users/reset-password.ts`:
  - Generate a random temp password (10 chars, mix of letters + digits).
  - Call `getAuth().updateUser(uid, { password: tempPassword })` and `usersRepository.update(uid, { mustChangePassword: true })`.
  - Return `{ tempPassword }` so admin can communicate to user.
  - Note: this is **admin-triggered reset**; user-initiated "Forgot Password" comes in Phase 08 via Firebase email link.
- [x] Create `lib/use-cases/users/index.ts` — barrel.
- [x] Create `app/api/users/route.ts` — `GET` (list, Admin only via Phase 04 wrapper, but for Phase 02 just bare handler) + `POST` (create).
- [x] Create `app/api/users/[id]/route.ts` — `GET` + `PATCH` + `DELETE`.
- [x] Create `app/api/users/[id]/reset-password/route.ts` — `POST` returns `{ tempPassword }`.
- [x] Create `lib/api/users.ts` — query keys + `useGetUsers`, `useGetUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`, `useResetUserPassword`.
- [x] Update project docs.

## Files to Create/Modify

**Create:**
- `types/users.ts`
- `lib/repositories/users/index.ts`
- `lib/use-cases/users/{create-user,list-users,get-user,update-user,delete-user,reset-password,index}.ts`
- `app/api/users/route.ts`
- `app/api/users/[id]/route.ts`
- `app/api/users/[id]/reset-password/route.ts`
- `lib/api/users.ts`

**Modify:**
- `lib/repositories/base-repository.ts` — verify if `create()` needs override or if we add `createWithId` as new method (less invasive). Document choice in this phase's notes.

## Docs to Update

- **`docs/01-project-context.md`**:
  - **API Routes table:** add `/api/users` (GET, POST), `/api/users/[id]` (GET, PATCH, DELETE), `/api/users/[id]/reset-password` (POST). Note: all Admin-only enforcement comes in Phase 04.
- **`docs/02-architecture.md`**:
  - Folder structure: add `types/users.ts`, `lib/repositories/users/`, `lib/use-cases/users/`, `app/api/users/`, `lib/api/users.ts`.
- **`docs/03-api-data-flow.md`**:
  - Mention `users` resource follows the canonical pattern with one twist: `createUser` does dual writes (Firebase Auth + Firestore). Document the rollback logic briefly.

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] `POST /api/users` creates a Firebase Auth user (visible in Firebase Console → Authentication) AND a Firestore profile (visible in Console → Firestore → users/{uid}). Both atomic.
- [x] If Firestore write fails after Firebase Auth user created → Firebase Auth user is rolled back (no orphan).
- [x] Creating user with duplicate email returns clear Indonesian error.
- [x] `PATCH` updating role/displayName works in both systems.
- [x] `DELETE` removes from both systems; deleting self returns 400 with Indonesian message.
- [x] Deleting the last Admin returns 400 "Tidak dapat menghapus admin terakhir."
- [x] `POST /api/users/[id]/reset-password` returns a 10-char temp password and forces user to change on next login (mustChangePassword=true).
- [x] All docs updated.

## Notes

- **`createWithId` vs override `create`:** `BaseRepository.create()` auto-generates ID via `collection().doc()`. Don't overload create — add new method `createWithId(id, payload)` that uses `collection().doc(id).set(...)`. Less surprising for callers of other resources.
- **Rollback semantics:** Firebase Auth + Firestore are 2 separate systems with no transactional guarantee. Best-effort rollback (delete Auth user if Firestore fails) handles 99% of cases. The 1% (rollback also fails) leaves orphan Auth user — acceptable for MVP, document as known limitation. A periodic reconciliation job could clean orphans later.
- **Last admin check:** count `where("role", "==", "admin").where("status", "==", "active")` — if `<= 1`, block delete. Same logic should also block role downgrade in `updateUser` (admin → non-admin if last admin) — add this guard.
- **Temp password generation:** use `crypto.randomBytes(8).toString("base64url").slice(0, 10)` or similar. Avoid ambiguous chars (0/O, 1/l) — use a deliberate alphabet if needed.
- **`mustChangePassword`:** set to `true` on create + on admin-triggered reset. Cleared in Phase 08 when user actually changes password.
- **No UI in this phase:** API is testable via `curl` with manual auth cookie OR by temporarily bypassing auth (just for Phase 02 dev — re-enable in Phase 04). Keep dev-only bypass behind a `process.env.SKIP_AUTH === "true"` env flag if helpful, but **remove the flag entirely before completing Phase 04**.
- **Field validation Zod gotcha:** email validation via `z.email()`. Password min 8 — Firebase enforces min 6 server-side, but we want stricter. DisplayName trim before save.
