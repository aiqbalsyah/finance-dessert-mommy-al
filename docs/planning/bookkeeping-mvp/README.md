# Bookkeeping MVP — Dessert Mommyal Finance

**Goal:** Implement a simple bookkeeping web app for the Dessert Mommyal dessert business covering 7 Firestore collections (`products`, `accounts`, `sales`, `purchases`, `salaries`, `expenses`, `unsold_items`) and 9 navigation menus, with receipt upload to Firebase Storage and a summary dashboard + period reports. UI in formal Indonesian.

**Status:** ✅ Complete
**Created:** 2026-04-26

## Phases

| # | Phase | Status | Description |
|---|-------|--------|-------------|
| 01 | foundation-and-locale | ✅ Done | Indonesian locale formatters (Rp, id-ID), sidebar nav (9 menus), root layout metadata, replace placeholder dashboard |
| 02 | master-accounts | ✅ Done | Rekening (accounts) — types, repo, use cases, API, hooks, CRUD page |
| 03 | master-products | ✅ Done | Master Produk — types, repo, use cases, API, hooks, CRUD page |
| 04 | receipt-upload-and-sales | ✅ Done | Shared `ReceiptUpload` component + upload API + Penjualan resource (full CRUD with receipt) |
| 05 | other-transactions | ✅ Done | Bahan (purchases), Gaji (salaries), Pengeluaran (expenses) — 3 resources reusing `ReceiptUpload` |
| 06 | unsold-items | ✅ Done | Barang Tidak Terjual — manual input form per produk per tanggal |
| 07 | dashboard-and-reports | ✅ Done | Dashboard ringkasan (omzet, saldo per rekening, top produk) + Laporan (filter periode, P&L, breakdown) |

Status legend: ⬜ Pending → 🔄 In Progress → ✅ Done → ⏭️ Skipped

## Architectural Conventions for All Phases

**Data flow (every resource follows this):**
```
types/{resource}.ts                              ← Interface, Zod schema, payload types
lib/repositories/{resource}/index.ts             ← Extends BaseRepository<T>, custom queries
lib/use-cases/{resource}/{action}.ts             ← One file per action (create-x, list-x, update-x, delete-x)
app/api/{resource}/route.ts                      ← Thin handler — calls use cases
app/api/{resource}/[id]/route.ts                 ← GET/PATCH/DELETE for single resource
lib/api/{resource}.ts                            ← TanStack Query hooks (queryKeys + useGetX, useCreateX, etc.)
app/(dashboard)/{menu-slug}/page.tsx             ← Thin page (imports content)
components/features/{menu-slug}/{x}-content.tsx  ← "use client" — main content
components/features/{menu-slug}/{x}-form.tsx     ← Form for create/edit
components/features/{menu-slug}/{x}-table.tsx    ← List/table view
components/features/{menu-slug}/{x}-skeleton.tsx ← Loading skeleton
```

**Server-only files (must `import "server-only"` at top):**
- `lib/firebase/*` (already done in foundation)
- `lib/repositories/*`
- `lib/use-cases/*`

**Indonesian UI rules:**
- All visible UI text in formal Indonesian (bahasa baku)
- Code identifiers, file names, Firestore field names: English
- Numbers via `formatCurrency` (Rp), dates via `formatDate` (id-ID)
- Examples of menu labels: "Penjualan", "Pengeluaran", "Master Produk", "Rekening", "Laporan", "Barang Gak Laku"
- Examples of buttons: "Simpan", "Batal", "Tambah", "Ubah", "Hapus", "Unggah Bukti"

## Menu → Route Mapping

| Menu (Indonesian) | Route | Page Folder |
|---|---|---|
| Dashboard | `/dashboard` | `components/features/dashboard/` |
| Penjualan | `/penjualan` | `components/features/penjualan/` |
| Bahan | `/bahan` | `components/features/bahan/` |
| Gaji | `/gaji` | `components/features/gaji/` |
| Pengeluaran | `/pengeluaran` | `components/features/pengeluaran/` |
| Barang Gak Laku | `/barang-gak-laku` | `components/features/barang-gak-laku/` |
| Master Produk | `/master-produk` | `components/features/master-produk/` |
| Rekening | `/rekening` | `components/features/rekening/` |
| Laporan | `/laporan` | `components/features/laporan/` |

All routes live in the `(dashboard)` route group to share the dashboard layout.

## Firestore Collections Summary

| Collection | Key Fields |
|---|---|
| `products` | name, price, category, isActive |
| `accounts` | name, type (`bank`\|`cash`), balance, code (e.g. "A", "B", "C") |
| `sales` | productId, productName, qty, unitPrice, total, accountId, soldAt, receiptUrl?, note? |
| `purchases` | description, amount, accountId, purchasedAt, vendor?, receiptUrl?, note? |
| `salaries` | employeeName, amount, accountId, paidAt, period (YYYY-MM), receiptUrl?, note? |
| `expenses` | category, description, amount, accountId, spentAt, receiptUrl?, note? |
| `unsold_items` | productId, productName, qty, date (YYYY-MM-DD), reason?, note? |

All docs include `createdAt` + `updatedAt` (Unix seconds, via `BaseEntity`).

## Out of Scope (deferred)

- Carry-over stock between days
- Production/HPP (cost of goods sold) tracking
- Auto-calculate of unsold from production − sales (user inputs manually)
- Auth roles (single-user app for now; existing auth is sufficient)
- Multi-tenant / multi-business
- Mobile app
