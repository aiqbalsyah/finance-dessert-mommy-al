# Phase 01: Foundation & Indonesian Locale

**Status:** ✅ Done
**Depends on:** None

## Goal

Set up the Indonesian locale (Rupiah currency + id-ID dates), update sidebar navigation to the 9 finance menus in formal Indonesian, refresh app metadata, and replace the existing data-center dashboard with a placeholder ready for the finance dashboard. After this phase the shell of the app reflects the finance app identity, even though no resource pages exist yet (each menu navigates to a placeholder "Coming soon" page).

## Tasks

- [x] Update `lib/formatters/number.ts` — `formatCurrency` defaults to `id-ID` + `IDR` (Rp prefix, dot thousands, comma decimal). Add `formatCompactRupiah` for dashboards (e.g. `Rp 1,2 jt`).
- [x] Update `lib/formatters/date.ts` — set `id-ID` locale via `date-fns/locale/id`. All `formatDate*` functions render Indonesian month names ("Apr" → "Apr" stays, but "January" → "Januari" for full names).
- [x] Update `app/layout.tsx` — set `<html lang="id">`, update Next.js metadata (`title`, `description`) to use `NEXT_PUBLIC_APP_NAME` + Indonesian description.
- [x] Update `components/layouts/dashboard/app-sidebar.tsx` + `nav-main.tsx` — replace existing nav (Dashboard / Components / Settings) with the 9 finance menus in Indonesian. Each menu links to its route with a Material Symbol icon. Group: "Utama" (Dashboard, Penjualan, Bahan, Gaji, Pengeluaran, Barang Gak Laku) + "Master" (Master Produk, Rekening) + "Laporan".
- [x] Update `components/layouts/dashboard/dashboard-header.tsx` — translate placeholder text (search/notification labels) to Indonesian.
- [x] Update `components/layouts/dashboard/nav-user.tsx` — translate menu items ("Account" → "Akun", "Notifications" → "Notifikasi", "Log out" → "Keluar", etc.).
- [x] Replace `components/features/dashboard/dashboard-content.tsx` (and remove other dashboard-* files) — render a simple "Selamat datang" placeholder card. The full dashboard is built in Phase 07.
- [x] Delete obsolete features no longer used: `components/features/components-showcase/` (and `app/(dashboard)/components/`) — components showcase is for Cerbrec base UI and not needed in the finance app. Remove `components/features/welcome/` if not linked from anywhere.
- [x] Create placeholder pages for the 8 non-dashboard menus: each `app/(dashboard)/{menu-slug}/page.tsx` renders a `PageHeader` + a "Belum diimplementasi" empty state using the existing `StateCard`.
- [x] Translate `components/features/welcome/welcome-content.tsx` (root `/` page) to Indonesian, OR redirect `/` → `/dashboard` if user is logged in.
- [x] Translate auth pages: `components/features/login/login-form.tsx` (labels, placeholders, button text, error messages).
- [x] Update `components/layouts/auth/auth-layout.tsx` — any visible text translated.
- [x] Update existing dashboard files in `components/layouts/dashboard/` (notification-sheet, page-header) — translate any hard-coded English labels.
- [x] Verify all 3D-related imports/files are not blocking — the finance app does not need `react-three-fiber`, `drei`, etc. Either remove the 3D dashboard demo + delete `components/shared/data-center-3d/` + uninstall `@react-three/*` `three` `postprocessing` deps, OR leave installed but unused. **Decision:** remove to keep bundle clean (separate sub-task documented in notes).
- [x] Update project docs (see "Docs to Update" — comprehensive, not summary lines).

## Files to Create/Modify

**Modify:**
- `lib/formatters/number.ts` — change `formatCurrency` default locale + currency to id-ID/IDR; add `formatCompactRupiah`.
- `lib/formatters/date.ts` — import `id` locale from `date-fns/locale`; pass as option to all `format*` calls.
- `app/layout.tsx` — `lang="id"`, metadata.
- `components/layouts/dashboard/app-sidebar.tsx` — brand header text, nav data structure.
- `components/layouts/dashboard/nav-main.tsx` — group labels in Indonesian.
- `components/layouts/dashboard/nav-user.tsx` — menu item labels in Indonesian.
- `components/layouts/dashboard/dashboard-header.tsx` — search placeholder, etc.
- `components/layouts/dashboard/notification-sheet.tsx` — labels.
- `components/layouts/dashboard/page-header.tsx` — back button label tooltip.
- `components/features/dashboard/dashboard-content.tsx` — replace with welcome placeholder.
- `components/features/login/login-form.tsx` — Indonesian labels.
- `components/features/welcome/welcome-content.tsx` — Indonesian copy.

**Delete:**
- `components/features/components-showcase/` (entire folder)
- `app/(dashboard)/components/` (entire folder)
- `components/features/dashboard/dashboard-activity.tsx`
- `components/features/dashboard/dashboard-alerts.tsx`
- `components/features/dashboard/dashboard-infrastructure.tsx`
- `components/features/dashboard/dashboard-overview-metrics.tsx`
- `components/shared/data-center-3d/` (entire folder)
- `components/shared/scene-3d.tsx` (if it exists)
- `data/dc-data-data-center.json`
- `data/site-layout.json`
- `data/dashboard.ts` (if data-center specific)
- `types/floor-layout.ts`
- `types/visualization-3d.ts`
- `types/tenants.ts`
- `lib/utils/grid-utils.ts`
- `public/models/server_rack.glb`
- `docs/3d/` (entire folder — finance app doesn't need 3D docs)
- `docs/08-3d-visualization.md` (referenced in CLAUDE.md but already missing — confirm and remove reference)

**Create:**
- `app/(dashboard)/penjualan/page.tsx` — placeholder (PageHeader + StateCard)
- `app/(dashboard)/bahan/page.tsx` — placeholder
- `app/(dashboard)/gaji/page.tsx` — placeholder
- `app/(dashboard)/pengeluaran/page.tsx` — placeholder
- `app/(dashboard)/barang-gak-laku/page.tsx` — placeholder
- `app/(dashboard)/master-produk/page.tsx` — placeholder
- `app/(dashboard)/rekening/page.tsx` — placeholder
- `app/(dashboard)/laporan/page.tsx` — placeholder
- `components/features/penjualan/placeholder-content.tsx` (and similar for each menu)

**Uninstall (optional but recommended for clean bundle):**
- `pnpm remove @react-three/drei @react-three/fiber @react-three/postprocessing three @types/three postprocessing`

## Docs to Update

- **`docs/01-project-context.md`**:
  - **Routes table**: Replace existing routes section. Document all 9 new routes with full descriptions:
    - `/dashboard` — Ringkasan keuangan harian/bulanan
    - `/penjualan` — Daftar dan input transaksi penjualan
    - `/bahan` — Daftar dan input pembelian bahan baku
    - `/gaji` — Daftar dan input pembayaran gaji karyawan
    - `/pengeluaran` — Daftar dan input pengeluaran lain-lain
    - `/barang-gak-laku` — Input dan daftar produk yang tidak terjual per tanggal
    - `/master-produk` — CRUD master produk
    - `/rekening` — CRUD rekening (bank dan cash)
    - `/laporan` — Laporan periode (P&L, breakdown per kategori, top produk)
  - Remove `/components` row.
  - **Tech Stack section**: remove `3D Visualization (R3F + drei)` line if 3D deps are removed in this phase.
  - **Fonts section**: keep as-is (Sora/Roboto Condensed/Ubuntu Mono still used).
- **`docs/02-architecture.md`**:
  - **Folder structure tree**: Remove `components/shared/data-center-3d/` block, `components/features/components-showcase/`, `components/features/dashboard/dashboard-{activity,alerts,infrastructure,overview-metrics}.tsx`, `data/dc-data-data-center.json`, `data/site-layout.json`, `types/floor-layout.ts`, `types/visualization-3d.ts`, `types/tenants.ts`, `lib/utils/grid-utils.ts`, `public/models/`, `docs/3d/`. Add 8 placeholder feature folders under `components/features/` with `# Placeholder — implemented in Phase 0X` comments.
- **`docs/04-conventions.md`**:
  - Add a new **"Locale & Indonesian UI"** subsection under Data Formatting:
    - Document the rule: all UI text in formal Indonesian, code identifiers in English.
    - List common label translations (Save → Simpan, Cancel → Batal, Delete → Hapus, etc.) as a reference table.
    - Confirm `formatCurrency` defaults to `id-ID` / `IDR` and `formatDate*` to `id-ID`.
- **`CLAUDE.md`**:
  - Remove the `3D Visualization` section if 3D is removed.
  - Remove links to `docs/08-3d-visualization.md` and `docs/3d/` from Docs section.
  - Add a brief mention under Key Rules: "All user-facing UI text in formal Indonesian; code identifiers in English."

## Acceptance Criteria

- [x] `pnpm build` passes with no warnings about removed deps.
- [x] Sidebar shows 9 menus (Dashboard, Penjualan, Bahan, Gaji, Pengeluaran, Barang Gak Laku, Master Produk, Rekening, Laporan) grouped per spec, with Indonesian labels and Material Symbol icons.
- [x] Each of 9 routes loads without error and shows either dashboard placeholder or "Belum diimplementasi" state.
- [x] `formatCurrency(25000)` returns `"Rp 25.000"` and `formatDate(unixTs)` returns Indonesian month name (e.g. `"15 Apr 2026"` or `"15 April 2026"` depending on format).
- [x] Login page labels are in Indonesian; root `/` redirects or shows Indonesian welcome.
- [x] All references to `components-showcase`, `data-center-3d`, and 3D types removed from codebase + docs.
- [x] All listed docs updated comprehensively (not summary lines).

## Notes

- **3D removal decision:** The Cerbrec base template ships with a heavy 3D data-center demo. The finance app has no use for it; removing keeps the bundle small and cleans up documentation. If you'd rather keep the 3D code around for future reference, leave the deps but at minimum remove the routes/pages so users don't navigate to broken demos.
- **Placeholder pages structure:** Use a tiny shared pattern like `<PageHeader title="Penjualan" description="..." showBack={false} /><StateCard title="Belum diimplementasi" description="Menu ini akan tersedia di phase berikutnya." />` to keep the visual consistency.
- **Sidebar grouping:** Three groups feels right: "Utama" (transaksi harian), "Master" (data master), "Laporan" (analitik). If a flat list feels simpler for the user, drop the groups.
- **Date locale gotcha:** `date-fns` v4 requires the `id` locale to be passed in options. Some functions (`formatRelative`, `formatDistance`) need the locale or they fall back to English.
- **Welcome page:** the existing `app/page.tsx` (welcome) can either stay as marketing landing or redirect to `/dashboard` for logged-in users. For an internal SMB tool, redirect is simpler — this is up to the executor of this phase.
