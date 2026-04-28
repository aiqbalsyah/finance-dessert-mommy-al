# Phase 08: Force Password Change + Forgot Password + Profile Page

**Status:** ✅ Done
**Depends on:** Phase 02 (`mustChangePassword` field), Phase 05 (UI for set-by-admin), Phase 06 (sidebar/auth context)

## Goal

Close the user lifecycle loop: when a user is created (or password reset by admin), they have a temp password. On their first login they should be forced to set a new password. Add a "Lupa kata sandi?" link on the login form for self-service reset, and a minimal profile page where any user can change their own password.

## Tasks

- [x] Create `app/(dashboard)/pengaturan/profil/page.tsx` — thin page → `<ProfilContent />`.
- [x] Create `components/features/profil/profil-content.tsx`:
  - Read-only fields: Email, Nama, Role (badges).
  - Button "Ubah Kata Sandi" → opens `<UbahKataSandiDialog>`.
- [x] Create `components/features/profil/ubah-kata-sandi-dialog.tsx`:
  - TanStack Form + Zod: `kataSandiSaatIni` (current), `kataSandiBaru` (new, min 8), `konfirmasiKataSandi` (must match).
  - On submit:
    1. Re-authenticate user via Firebase: `reauthenticateWithCredential(user, EmailAuthProvider.credential(email, currentPassword))`. If wrong, show "Kata sandi saat ini salah."
    2. Call `updatePassword(user, newPassword)` via Firebase Web SDK.
    3. POST to `/api/auth/clear-must-change-password` to set `mustChangePassword: false` in Firestore.
    4. Toast success + close dialog.
- [x] Create `app/api/auth/clear-must-change-password/route.ts` — `POST` (wrapped with `withAuth({ allowAny: true })`):
  - Get current user from `withAuth` callback.
  - Call `usersRepository.update(user.id, { mustChangePassword: false })`.
  - Return `{ success: true }`.
- [x] Add **forced redirect on first login**:
  - Update `context/auth-provider.tsx`: when `user.mustChangePassword === true` AND current pathname is not `/pengaturan/profil` AND not `/auth/login`, redirect to `/pengaturan/profil` and auto-open the change-password dialog (use a query param like `?force=true` to trigger).
  - Update `profil-content.tsx` to read the `?force` query param and auto-open dialog with a banner: "Anda harus mengubah kata sandi sebelum melanjutkan."
  - Disable navigation away from profile while `mustChangePassword === true` — sidebar nav items become disabled or clicking them re-redirects to profile. Easiest implementation: gate at AuthProvider level (intercept route changes via Next.js router).
- [x] Add **"Lupa kata sandi?" link on login form**:
  - Update `components/features/login/login-form.tsx` — replace existing "Lupa kata sandi?" anchor (currently goes to `#`) with a click handler that:
    1. Prompts for email if empty (or uses the email field value).
    2. Calls Firebase `sendPasswordResetEmail(authClient, email)`.
    3. Shows toast: "Tautan reset kata sandi telah dikirim ke {email}." even if email doesn't exist (don't leak account existence — just always show success).
- [x] Add **profile menu item** to sidebar (or move to nav-user dropdown):
  - Recommendation: add to `nav-user.tsx` dropdown as "Profil" (above "Keluar"), so all users have access regardless of role.
  - Remove (or repurpose) the existing placeholder "Akun" item — point it at `/pengaturan/profil`.
- [x] Update project docs.

## Files to Create/Modify

**Create:**
- `app/(dashboard)/pengaturan/profil/page.tsx`
- `components/features/profil/{profil-content,ubah-kata-sandi-dialog}.tsx`
- `app/api/auth/clear-must-change-password/route.ts`

**Modify:**
- `context/auth-provider.tsx` — force redirect logic on first-login.
- `components/features/login/login-form.tsx` — wire forgot-password link.
- `components/layouts/dashboard/nav-user.tsx` — add "Profil" item, point "Akun" to it.

## Docs to Update

- **`docs/01-project-context.md`**:
  - Routes table: add `/pengaturan/profil`.
  - API Routes: add `/api/auth/clear-must-change-password`.
- **`docs/02-architecture.md`**:
  - Folder structure: add `app/(dashboard)/pengaturan/profil/`, `components/features/profil/`, `app/api/auth/clear-must-change-password/`.
- **`docs/04-conventions.md`**:
  - Under Auth: document the first-login flow + how `mustChangePassword` works.

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] Admin creates a new user (Phase 05 flow) → user is given temp password.
- [x] User logs in with temp password → redirected to `/pengaturan/profil?force=true` → Ubah Kata Sandi dialog auto-opens with banner "Anda harus mengubah kata sandi sebelum melanjutkan."
- [x] User can't navigate away (clicking sidebar items returns them to profile) until password changed.
- [x] After password change → `mustChangePassword` cleared → user can navigate freely.
- [x] Existing user (mustChangePassword=false) can still visit profile and change password voluntarily — no force flow.
- [x] "Lupa kata sandi?" link on login form sends Firebase reset email.
- [x] Wrong current password in change dialog shows "Kata sandi saat ini salah." (Indonesian).
- [x] All docs updated.

## Notes

- **Re-auth before password change is required by Firebase** when the session is older than ~5 minutes. Catching the `auth/requires-recent-login` error and asking user to re-login is the alternative, but for simplicity we always require current password — works always, simpler UX.
- **Don't leak account existence in forgot-password flow:** Firebase `sendPasswordResetEmail` throws if email doesn't exist. Catch the error and ALWAYS show "Tautan telah dikirim ke {email}". Don't tell attackers which emails are real.
- **Force-redirect implementation:** in `AuthProvider`, watch `pathname` (via `usePathname`) + `user.mustChangePassword` and `useRouter().replace()` if condition met. Be careful to whitelist paths (`/auth/login`, `/pengaturan/profil`) to avoid infinite redirects.
- **Disabled nav while forced:** simplest approach — apply `pointer-events-none opacity-50` class to sidebar when `mustChangePassword === true`. Cleaner: detect in the route-level `useEffect` and bounce them back. Pick one and document.
- **What if user logs out without changing password?** Next login still has `mustChangePassword=true` → same flow. Defensive against partial state.
- **Optional polish (defer if running short):**
  - Show last login time on profile page (requires updating `lastLoginAt` in `users` collection on every successful login — small change in `app/api/auth/login/route.ts`).
  - Avatar upload — out of scope, keep `displayName` as the only personalization.
- **Why dialog vs full page for change password?** Dialog keeps users in context (especially in force flow). Full page would be heavier and require route guard logic. Dialog also matches the project's pattern (Rekening, Penjualan, etc. all use dialogs for forms).
- **Plan complete after this phase:** the auth + RBAC system is now production-ready. Recommended next iteration: deploy to a staging environment and do an end-to-end role test (create 4 users, one per role, verify all permission boundaries hold).
