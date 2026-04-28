# Phase 06: Client-Side Guards (Sidebar Filter + Action Buttons)

**Status:** ✅ Done
**Depends on:** Phase 04 (RBAC enforcement on API), Phase 05 (Pengguna menu exists to filter)

## Goal

Make the UI reflect what the user can/can't do — hide menus they have no access to, disable buttons they can't use, show their role badge in the user menu. The API is already the security boundary (Phase 04); this phase is about UX polish so users don't see dead-end menus and "Forbidden" toasts.

## Tasks

- [x] Update `context/auth-provider.tsx`:
  - Extend `AuthState` type: `{ user: User | null, role: UserRole | null, isAuthenticated, isLoading, can: (permission: Permission) => boolean }`.
  - The `can()` helper internally calls the same `permissionsByRole` map (re-exported from `lib/auth/permissions.ts` — but ONLY the data, NOT the server-only functions). To keep the permissions data client-safe, **extract the matrix to its own client-safe file** `lib/auth/permissions-matrix.ts` (no `"server-only"`), then `lib/auth/permissions.ts` re-exports it + adds server-only helpers (`requirePermission`, error classes).
  - Update `useAuth()` to return the extended state.
- [x] Update `components/layouts/dashboard/app-sidebar.tsx`:
  - Replace static `navGroups` array with a function that filters items based on `useAuth().can(permission)`.
  - Each nav item gets a `requiredPermission?: Permission` field. Items without it are visible to everyone logged in.
  - Mapping (for reference):
    - Dashboard → no permission required (all logged-in users)
    - Penjualan → `sales:read`
    - Bahan → `purchases:read`
    - Gaji → `salaries:read`
    - Pengeluaran → `expenses:read`
    - Barang Tidak Terjual → `unsold-items:read`
    - Master Produk → `products:read`
    - Rekening → `accounts:read`
    - Laporan → `reports:read`
    - Pengaturan → Pengguna → `users:manage`
  - For the "Pengaturan" group: hide the entire group label if no items inside are visible.
- [x] Update `components/layouts/dashboard/nav-user.tsx`:
  - Show role badge next to the user name in the dropdown menu trigger area (or in the dropdown content header). Use existing `Badge` component with same color scheme as `pengguna-table.tsx`.
- [x] Add a tiny shared helper `components/shared/permission-guard.tsx`:
  - `<PermissionGuard permission="accounts:create" fallback={null}>{children}</PermissionGuard>` — renders children only if `useAuth().can(permission)`.
  - Use this to wrap the "Tambah" buttons in every feature page (Penjualan, Bahan, etc.) so non-permitted roles don't see them.
- [x] Update each feature `*-content.tsx` to use `PermissionGuard` around the action button in `<PageHeader action={...} />`. Same for `Ubah` / `Hapus` items in DataTable row dropdowns — wrap each `DropdownMenuItem` with the guard, OR (cleaner) compute `canEdit`/`canDelete` once in the table component and conditionally render. Choose the cleaner option per file.
- [x] Mapping for which feature needs which permission:
  - Penjualan create button → `sales:create`
  - Penjualan edit/delete → `sales:update`/`sales:delete`
  - Bahan, Gaji, Pengeluaran → `<resource>:create`/`update`/`delete` (Manager + Admin only — Kasir + Viewer hide)
  - Master Produk → Admin/Manager only for write
  - Rekening Tambah → Admin/Manager (`accounts:create`); Hapus → Admin only (`accounts:delete`)
  - Barang Tidak Terjual → Kasir + Manager + Admin for write
- [x] **Add `<NotAuthorized>` page state** in `app/(dashboard)/pengaturan/pengguna/page.tsx` (and similar admin-only future pages): if `useAuth().can("users:manage")` is false, render a `StateCard` with "Anda tidak memiliki akses ke halaman ini." instead of the content. (Defense-in-depth — the menu is hidden, but typed URL still loads.)
- [x] Update project docs.

## Files to Create/Modify

**Create:**
- `lib/auth/permissions-matrix.ts` — client-safe matrix data (split from `permissions.ts`).
- `components/shared/permission-guard.tsx` — render-prop component.

**Modify:**
- `lib/auth/permissions.ts` — re-export matrix, keep server-only helpers.
- `context/auth-provider.tsx` — extend with `role` + `can()`.
- `components/layouts/dashboard/app-sidebar.tsx` — filter nav by permission.
- `components/layouts/dashboard/nav-user.tsx` — show role badge.
- `app/(dashboard)/pengaturan/pengguna/page.tsx` — guard with NotAuthorized state.
- All `components/features/*/*-content.tsx` (8 files) — guard "Tambah" buttons.
- All `components/features/*/*-table.tsx` (8 files) — guard row actions Ubah/Hapus.

## Docs to Update

- **`docs/02-architecture.md`**:
  - Add `lib/auth/permissions-matrix.ts` to folder tree.
  - Add `components/shared/permission-guard.tsx` to shared tree (alphabetical).
  - Update Auth System section: explain the split between `permissions-matrix.ts` (client-safe data) and `permissions.ts` (server-only helpers + same matrix re-export).
- **`docs/04-conventions.md`**:
  - Add a new section **"Permission UI guards"** explaining: "Use `<PermissionGuard>` for action buttons. Use `useAuth().can()` for inline conditionals. Don't rely on UI guards alone — API enforcement (Phase 04) is the real boundary; UI guards are UX."
- **`docs/07-shared-components.md`**:
  - Add full **`PermissionGuard`** section: import path, description, Props table (`permission: Permission`, `fallback?: ReactNode`, `children: ReactNode`), 3 usage examples (button wrap, conditional row render, page-level guard).

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] Login as Kasir → sidebar shows: Dashboard, Penjualan, Master Produk (read-only), Rekening (read-only), Barang Tidak Terjual. NO: Bahan/Gaji/Pengeluaran/Laporan/Pengaturan.
- [x] Login as Viewer → sidebar shows all menus EXCEPT Pengaturan. All "Tambah"/"Ubah"/"Hapus" buttons hidden.
- [x] Login as Manager → all menus EXCEPT Pengaturan. Hapus rekening hidden (Admin-only). Everything else editable.
- [x] Login as Admin → all menus + all actions visible.
- [x] Role badge visible in nav-user dropdown.
- [x] Typing `/pengaturan/pengguna` URL as Kasir → page loads with "Anda tidak memiliki akses..." state, not white screen or content.
- [x] All docs updated.

## Notes

- **`server-only` import = client crash:** if `lib/auth/permissions.ts` imports `"server-only"`, the client can't use any export from it (even pure data). That's why we split into `permissions-matrix.ts` (client-safe) + `permissions.ts` (server-only helpers re-exporting matrix data). Server code uses `permissions.ts`; client code uses `permissions-matrix.ts` directly.
- **Why split instead of conditional `import "server-only"`?** Conditional imports don't work — `"server-only"` is a module-level marker. Better to be explicit with two files.
- **`PermissionGuard` minimal API:** keep it dumb. No "show different content based on role" complexity — just gate visibility. For more complex logic (e.g. show in disabled state with tooltip), use `useAuth().can()` inline:
  ```tsx
  const canDelete = useAuth().can("accounts:delete")
  <Button disabled={!canDelete}>...</Button>
  ```
- **Trade-off — disabled vs hidden:** for "Tambah" buttons, **hide** them (no clutter). For row actions in dropdowns where users with read access also see the dropdown trigger, prefer to **hide the disabled action** rather than show greyed out — fewer surprises. Inconsistency between forms can confuse, so pick one approach (recommend hide for both).
- **Don't over-engineer the page-level guard:** for now, simple conditional render in the page's content component is fine. If we get many admin-only pages, extract to a `<RequirePermission>` wrapper.
- **Sidebar tooltip behavior:** sidebar items have tooltips when collapsed. Tooltips for items that are hidden should also disappear (they will, since the items themselves don't render).
- **Hover state for hidden Pengaturan group:** if the group label "Pengaturan" still renders even when all sub-items are hidden, you'll see a section header pointing to nothing. Filter the group out entirely if `items.length === 0` after filtering.
