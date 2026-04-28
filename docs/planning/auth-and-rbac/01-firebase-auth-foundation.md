# Phase 01: Firebase Auth Foundation

**Status:** ✅ Done
**Depends on:** None (replaces existing dummy auth in-place)

## Goal

Replace the dummy auth system with real Firebase Authentication. After this phase, login uses Firebase Auth (email + password), the session lives in an httpOnly cookie carrying a Firebase ID token (verified server-side on every request), and `/api/auth/me` returns the current user from Firestore. The user-management UI doesn't exist yet — for now, the **first user is created manually via Firebase Console**, and that user's profile in Firestore `users` collection is also seeded manually (Phase 02 automates this).

## Tasks

- [x] `pnpm add firebase` — install Firebase Web SDK for client-side sign-in.
- [x] Add Firebase Web SDK env vars to `.env.local`: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` (values from Firebase Console → Project Settings → Web App config).
- [x] Create `lib/firebase/client.ts` — Web SDK init (singleton), exports `getFirebaseAuthClient()` for use in client components only. Add `"use client"` directive note in JSDoc — file should NOT have `import "server-only"`.
- [x] Update `types/auth.ts` — `User` interface (id = Firebase UID, email, displayName, role, status, mustChangePassword, createdAt, updatedAt). Drop `avatar` and `password` fields. Add `UserRole = "admin" | "manager" | "kasir" | "viewer"`. Add Zod schema `loginPayloadSchema`.
- [x] Replace `lib/services/auth/index.ts`:
  - Delete dummy implementation entirely (don't keep the file as legacy — replace contents with thin Firebase Admin helpers).
  - Export `verifyIdToken(token)` → uses `getAuth(getFirebaseApp()).verifyIdToken(token)` and returns the decoded token.
  - Export `revokeRefreshTokens(uid)` for logout.
- [x] Update `app/api/auth/login/route.ts`:
  - Accept `{ idToken: string }` in request body (client signs in with Firebase first, then sends ID token).
  - Verify token via `verifyIdToken`.
  - Look up user profile in Firestore `users` collection by UID. If profile doesn't exist OR `status === "disabled"`, reject with 403.
  - Set httpOnly cookie `auth-token` = ID token (7-day max-age, secure in prod, sameSite lax).
  - Return `{ user }` (full Firestore profile).
- [x] Update `app/api/auth/me/route.ts`:
  - Read `auth-token` cookie.
  - If absent → 401.
  - Verify token via Admin SDK. If invalid/expired → 401, clear cookie.
  - Look up user profile in Firestore by UID → return profile. If profile missing → 401 (treat as logged out).
- [x] Update `app/api/auth/logout/route.ts`:
  - Read cookie → decode UID → call `revokeRefreshTokens(uid)` (best effort, don't fail logout if it errors).
  - Clear `auth-token` cookie.
  - Return `{ success: true }`.
- [x] Update `lib/api/auth.ts` `useLogin` mutation:
  - Sign in via `signInWithEmailAndPassword(authClient, email, password)` first.
  - Call `user.getIdToken()` to obtain fresh token.
  - POST `{ idToken }` to `/api/auth/login`.
  - On success, set query data + redirect (existing behavior).
  - Map Firebase error codes to Indonesian messages (`auth/invalid-credential`, `auth/user-disabled`, `auth/too-many-requests`).
- [x] Update `lib/api/auth.ts` `useLogout` — also call `signOut(authClient)` to clear local Firebase session before hitting `/api/auth/logout`.
- [x] Update `components/features/login/login-form.tsx`:
  - Existing UI mostly fine — error message wiring needs to surface specific Firebase errors (return from `useLogin` error object, show in `<FieldError>` or inline message).
- [x] Delete `data/auth.ts` (dummy data file).
- [x] Update `context/auth-provider.tsx` — minor: ensure it handles `null` user gracefully when `useCurrentUser` returns 401 (already does, but verify).
- [x] **Manual seed (one-time, document in phase notes):** create the first admin user in Firebase Console → Authentication → Add User. Then create matching doc in Firestore `users/{uid}` with `{ email, displayName, role: "admin", status: "active", mustChangePassword: false, createdAt: <unix>, updatedAt: <unix> }`.
- [x] Update project docs (see "Docs to Update" — comprehensive).

## Files to Create/Modify

**Create:**
- `lib/firebase/client.ts` — Web SDK client init.

**Modify (replace contents):**
- `types/auth.ts` — new shape (drop password/avatar, add role/status/mustChangePassword).
- `lib/services/auth/index.ts` — Firebase Admin auth helpers (verify, revoke).
- `app/api/auth/login/route.ts` — verify ID token + lookup profile + set cookie.
- `app/api/auth/me/route.ts` — verify cookie + lookup profile.
- `app/api/auth/logout/route.ts` — revoke + clear cookie.
- `lib/api/auth.ts` — Firebase client sign-in flow + Indonesian error mapping.
- `components/features/login/login-form.tsx` — surface specific error messages.
- `context/auth-provider.tsx` — verify null handling.
- `.env.local` — add 4 `NEXT_PUBLIC_FIREBASE_*` vars.

**Delete:**
- `data/auth.ts`

## Docs to Update

- **`docs/01-project-context.md`**:
  - **Environment Variables → Public table:** add 4 rows for `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` (description: "Firebase Web SDK config — public, identifies project to client SDK").
  - **API Routes table:** update existing 3 auth rows to reflect new behavior (`/api/auth/login` now expects `{ idToken }` and validates against Firestore `users`).
  - **Tech Stack:** add "**Auth:** Firebase Authentication (email + password) + Firestore `users` profile" line.
- **`docs/02-architecture.md`**:
  - **Folder structure:** add `lib/firebase/client.ts` (with comment explaining it's the only Firebase file that's NOT server-only).
  - **Auth System section:** rewrite — document new flow (client signs in via Firebase Web SDK → sends ID token → server verifies + looks up profile → sets httpOnly cookie). List `User`, `UserRole`, the new login flow, and the manual seed step.
- **`docs/03-api-data-flow.md`**:
  - Add a new section **"Authentication flow"** at the top (above Auth Context), explaining: client → Firebase Web SDK → ID token → POST `/api/auth/login` with token → server verifies + looks up Firestore profile → httpOnly cookie set → subsequent requests verified via cookie.
- **`docs/04-conventions.md`**:
  - Under Auth section: clarify that `useAuth()` returns `{ user: User | null, isAuthenticated, isLoading }` where `User` now includes `role`. Permissions logic comes in Phase 06.
- **`CLAUDE.md`**:
  - Update Auth section: drop reference to dummy data, mention Firebase Auth + cookie-based session + manual seed for first user.

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] After manually seeding first admin user in Firebase Console + Firestore, login with email + password works → redirect to `/dashboard`.
- [x] Refreshing the page after login keeps the user logged in (cookie + `/api/auth/me` returns profile).
- [x] Logout button clears cookie, redirects to `/auth/login`, and subsequent navigation back to `/dashboard` doesn't show stale data (TanStack Query auth cache cleared).
- [x] Wrong password shows Indonesian error: "Email atau kata sandi salah." (or similar).
- [x] Disabled user can't log in → "Akun Anda telah dinonaktifkan." (403 from `/api/auth/login`).
- [x] No reference to `data/auth.ts` remains in codebase (verify with grep).
- [x] All listed docs updated with comprehensive detail.

## Notes

- **Manual seed step is critical** — without a Firestore profile, even a valid Firebase Auth account can't log in (server rejects). Document this clearly in CLAUDE.md so future you / contributors don't get stuck.
- **Why ID token instead of session cookie?** Firebase recommends session cookies for longer-lived sessions; ID tokens last only 1 hour. For MVP we stick with ID token in cookie + 7-day max-age — token refresh on the client (Web SDK auto-refreshes) and `/api/auth/me` verifies on each call. If verification fails (token expired), client falls back to login. This is OK for SMB scale; for high-traffic apps, switch to Firebase session cookies (`createSessionCookie`).
- **Cookie security:** httpOnly + secure (in prod) + sameSite=lax. The token in cookie is the actual Firebase ID token — server-side verification against Google's public keys is the source of truth, not the cookie itself.
- **Error message i18n:** Firebase error codes are stable strings (`auth/invalid-credential`, `auth/user-not-found`, `auth/wrong-password`, `auth/too-many-requests`, `auth/user-disabled`). Build a small map in `lib/api/auth.ts`. Don't expose raw Firebase messages to user.
- **Testing without UI:** for Phase 01 verification, you can `curl -X POST http://localhost:3000/api/auth/login -d '{"idToken":"..."}'` after grabbing a token from Firebase Auth REST API or browser console (`firebase.auth().currentUser.getIdToken()`).
- **TODO for Phase 02:** automate user creation (instead of manual Firebase Console + Firestore) — `createUser` use case in Phase 02 will call `getAuth().createUser()` + Firestore write in one transaction.
