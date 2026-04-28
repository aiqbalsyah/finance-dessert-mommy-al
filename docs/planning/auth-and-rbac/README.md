# Auth & RBAC

**Goal:** Replace the dummy auth with Firebase Authentication, add a user management UI, and implement role-based access control across 4 roles (Admin, Manager, Kasir, Viewer) — enforced at API routes, client UI, sidebar nav, and form actions. Add a light audit trail (`createdBy`/`updatedBy`) on transaction documents.

**Status:** ✅ Done
**Created:** 2026-04-27

## Phases

| # | Phase | Status | Description |
|---|-------|--------|-------------|
| 01 | firebase-auth-foundation | ✅ Done | Replace dummy auth with Firebase Authentication (web SDK + admin SDK), httpOnly cookie session, /me endpoint reads from `users` collection |
| 02 | users-collection | ✅ Done | `users` collection — types, repo, use cases (createUser creates Firebase Auth user + Firestore profile), API |
| 03 | auth-middleware | ✅ Done | `lib/auth/` — getCurrentUser, permissions matrix, withAuth wrapper for API routes |
| 04 | apply-rbac-to-existing-routes | ✅ Done | Wrap all 16 existing API routes with `withAuth({ permission })` — accounts, products, sales, purchases, salaries, expenses, unsold-items, reports, uploads |
| 05 | user-management-ui | ✅ Done | `/pengaturan/pengguna` — Admin-only UI to create/update/disable/delete users, assign role |
| 06 | client-side-guards | ✅ Done | Extend `useAuth()` with role + can() helper, filter sidebar nav per role, disable action buttons + tooltip for forbidden actions |
| 07 | audit-trail | ✅ Done | Add `createdBy`/`updatedBy` to BaseEntity, inject current user in all create/update use cases, surface in tables |
| 08 | force-password-change | ✅ Done | First-login flow (`mustChangePassword` → redirect to `/pengaturan/profil?force=true`), forgot-password link on login form, profile page with Ubah Kata Sandi dialog |

Status legend: ⬜ Pending → 🔄 In Progress → ✅ Done → ⏭️ Skipped

## Assumptions (refine before execute if needed)

1. **Skala:** Small SMB, 1–10 user. Single tenant (1 bisnis).
2. **4 role hard-coded:** Admin / Manager / Kasir / Viewer
3. **Data shared** (single business — semua user lihat data yang sama)
4. **Light audit trail:** `createdBy` + `updatedBy` per dokumen, **bukan** collection `audit_log` terpisah
5. **Admin invite flow:** Admin manual buat akun (email + temp password + role), user wajib ganti password saat login pertama
6. **Sign-in:** Email + password saja (no social login MVP)
7. **Password reset:** Firebase default (email magic link)

## Permissions matrix (canonical reference for all phases)

| Resource | Admin | Manager | Kasir | Viewer |
|---|---|---|---|---|
| `accounts` read | ✅ | ✅ | ✅ | ✅ |
| `accounts` create/update | ✅ | ✅ | ❌ | ❌ |
| `accounts` delete | ✅ | ❌ | ❌ | ❌ |
| `products` read | ✅ | ✅ | ✅ | ✅ |
| `products` create/update/delete | ✅ | ✅ | ❌ | ❌ |
| `sales` read | ✅ | ✅ | ✅ | ✅ |
| `sales` create/update/delete | ✅ | ✅ | ✅ | ❌ |
| `purchases` read | ✅ | ✅ | ❌ | ✅ |
| `purchases` create/update/delete | ✅ | ✅ | ❌ | ❌ |
| `salaries` read | ✅ | ✅ | ❌ | ✅ |
| `salaries` create/update/delete | ✅ | ✅ | ❌ | ❌ |
| `expenses` read | ✅ | ✅ | ❌ | ✅ |
| `expenses` create/update/delete | ✅ | ✅ | ❌ | ❌ |
| `unsold-items` read | ✅ | ✅ | ✅ | ✅ |
| `unsold-items` create/update/delete | ✅ | ✅ | ✅ | ❌ |
| `reports` read | ✅ | ✅ | ❌ | ✅ |
| `users` (manage) | ✅ | ❌ | ❌ | ❌ |
| `uploads` (write) | ✅ | ✅ | ✅ | ❌ |

This table is the single source of truth for Phase 03 (`lib/auth/permissions.ts`), Phase 04 (API route guards), Phase 05 (Admin-only menu), and Phase 06 (UI hide/disable).

## Out of scope (deferred)

- Multi-tenant (multiple businesses dalam 1 instance)
- Granular per-user permissions (custom permission set di luar 4 role)
- Audit log collection terpisah
- Social sign-in (Google/Apple), SSO (SAML/OIDC)
- 2FA / MFA
- API keys for programmatic access
- Rate limiting per user
- Session management UI (active sessions, remote logout)

## Migration & breaking changes

- `lib/services/auth/index.ts` (dummy) — **replaced**, not extended
- `data/auth.ts` (dummy data) — **deleted**
- `useCurrentUser()` return shape changes (richer User with role) — **update all callers**
- New env vars `NEXT_PUBLIC_FIREBASE_*` (web SDK config — public, OK to commit to docs but values in `.env.local`)
- Existing transaction documents have no `createdBy` — Phase 07 makes the field optional so old data still renders
