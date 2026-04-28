# Phase 05: User Management UI (Pengaturan → Pengguna)

**Status:** ✅ Done
**Depends on:** Phase 02 (users API), Phase 04 (RBAC enforces Admin-only access)

## Goal

Build the Admin-only user management page so Admins can create, edit, disable, and delete users + reset passwords through the UI instead of API calls. Add a new top-level menu **"Pengaturan"** to sidebar (Admin-only) with **"Pengguna"** as the first sub-item.

## Tasks

- [x] Create route `app/(dashboard)/pengaturan/pengguna/page.tsx` — thin import + render of `PenggunaContent`.
- [x] Create `components/features/pengguna/pengguna-content.tsx`:
  - `"use client"`.
  - Header with `<PageHeader title="Pengguna" description="Kelola pengguna dan hak aksesnya." action={<Button onClick={handleAdd}>Tambah Pengguna</Button>} />`.
  - Loading/error/success states wired to `useGetUsers()`.
  - Form Dialog (create + edit) + AlertDialog for delete confirmation + AlertDialog for "Reset password" confirmation showing the generated temp password (so admin can copy + share).
- [x] Create `components/features/pengguna/pengguna-table.tsx`:
  - Columns: Email, Nama, Role (Badge: Admin=destructive, Manager=info, Kasir=success, Viewer=muted), Status (Aktif/Nonaktif badge), Aksi (dropdown: Ubah, Reset Kata Sandi, Hapus).
  - DataTableCard search by email, filter by role + status.
  - Hide "Hapus" item for the row matching current user (use `useAuth()`).
- [x] Create `components/features/pengguna/pengguna-form.tsx`:
  - TanStack Form + Zod schema `userCreateSchema` (Phase 02).
  - Fields: Email (disabled in edit mode — Firebase Auth doesn't allow email change without re-auth, defer that), Nama, Password (only shown in create mode — option: "Generate otomatis" checkbox + manual input), Role (Select dengan 4 opsi Indonesian), Status (Switch Aktif/Nonaktif).
  - On create success: show AlertDialog "Pengguna dibuat. Berikan kata sandi sementara ini ke pengguna: **{temp}**" with copy button.
  - On edit success: just toast.
- [x] Create `components/features/pengguna/pengguna-skeleton.tsx`.
- [x] Create `components/features/pengguna/pengguna-reset-password-dialog.tsx` — separate AlertDialog component that calls `useResetUserPassword` mutation, shows the returned temp password with copy button.
- [x] Update `components/layouts/dashboard/app-sidebar.tsx`:
  - Add new group **"Pengaturan"** at the bottom of `navGroups`.
  - Single sub-item: `{ title: "Pengguna", url: "/pengaturan/pengguna", icon: <Icon name="group" /> }`.
  - In Phase 06, the entire "Pengaturan" group will be hidden for non-Admins. For now, render unconditionally (RBAC API enforcement still blocks non-Admin from doing damage).
- [x] **Bootstrap:** since first user must exist before login (manually seeded in Phase 01), once Phase 05 ships and the first Admin can log in via UI, all subsequent users are created here. Document this lifecycle clearly.
- [x] Update project docs.

## Files to Create/Modify

**Create:**
- `app/(dashboard)/pengaturan/pengguna/page.tsx`
- `components/features/pengguna/{pengguna-content,pengguna-form,pengguna-table,pengguna-skeleton,pengguna-reset-password-dialog}.tsx`

**Modify:**
- `components/layouts/dashboard/app-sidebar.tsx` — add "Pengaturan" group.

## Docs to Update

- **`docs/01-project-context.md`**:
  - Routes table: add `/pengaturan/pengguna` row → "Manajemen pengguna (Admin only)".
- **`docs/02-architecture.md`**:
  - Folder structure: add `app/(dashboard)/pengaturan/pengguna/`, `components/features/pengguna/`.
  - Dashboard Layout Features section: add "Pengaturan" group to navigation list.

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] Logged in as Admin → see "Pengaturan" group in sidebar with "Pengguna" sub-item → click → list users.
- [x] Click "Tambah Pengguna" → fill form → save → user appears in list AND in Firebase Console (Authentication tab) AND in Firestore (`users` collection).
- [x] After save, dialog shows the temp password with copy button (only when create, not edit).
- [x] Edit user → change role → save → role badge updates in table.
- [x] Disable user (toggle Status switch) → save → user can't log in anymore (verify by trying in incognito).
- [x] Delete user → AlertDialog confirms → user removed from both systems.
- [x] Try to delete self → "Hapus" option hidden in dropdown for own row.
- [x] Try to delete the last Admin → API returns 400 → toast in Indonesian.
- [x] Reset password action → shows temp password → admin copies + tells user → user logs in with temp → forced to change (Phase 08 closes this loop, but the `mustChangePassword=true` flag is set in this phase).
- [x] All docs updated.

## Notes

- **Email change:** Firebase Auth `updateEmail` requires recent re-auth. For MVP, treat email as immutable. Show as `<Input disabled>` in edit mode with a tooltip explaining.
- **Why a "Pengaturan" group instead of just "Pengguna"?** Future settings (e.g. business profile, integrations, audit log viewer) naturally cluster here. Even with one item now, the grouping reads better than a flat 10th menu item.
- **Sidebar order rationale:** Pengaturan goes at the bottom (separate group) because it's admin-y / less frequently used than transactional menus. Same convention as most SaaS dashboards.
- **Generated temp password UX:** show it ONCE in the success dialog. If admin closes without copying, they have to use the "Reset Password" action to get a new one (we don't store plaintext). Add a "Copy" button using `navigator.clipboard.writeText()`.
- **Prevent footgun:** the form's submit button should be disabled while the temp password is being shown — admin needs to actively dismiss it. Otherwise admins might miss the password and confuse the new user.
- **Filter current user from delete dropdown:** `const { user: currentUser } = useAuth(); ... if (row.original.id === currentUser?.id) hide-delete`. Don't rely on API rejection alone — UI affordance matters.
- **No bulk actions for MVP** — single-row aksi only. Bulk disable/role-change can come later if needed.
- **Defer:** "Send invite email with login link" — needs an email service (SendGrid/Resend). For MVP, admin manually shares URL + temp password via WhatsApp or whatever. Put a TODO in code comments.
