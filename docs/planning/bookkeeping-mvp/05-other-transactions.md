# Phase 05: Bahan, Gaji, Pengeluaran (Purchases, Salaries, Expenses)

**Status:** ✅ Done
**Depends on:** Phase 04 (receipt upload + accounts + products)

## Goal

Implement the three remaining outflow transaction resources following the same pattern as Phase 04 (sales), reusing the `ReceiptUpload` shared component. After this phase the user can record bahan baku purchases, gaji karyawan, and pengeluaran lain-lain — each with optional receipt upload, account selection, and date.

## Tasks

This phase implements **3 resources** with the same vertical-slice pattern as Phase 04. Treat each as a sub-section.

### 5.1 Bahan (purchases)

- [x] `types/purchases.ts` — `Purchase` (BaseEntity + `description`, `amount`, `accountId`, `purchasedAt`, `vendor?`, `receiptUrl?`, `receiptPath?`, `note?`), Zod schemas.
- [x] `lib/repositories/purchases/index.ts` — extends BaseRepository, add `findByDateRange`.
- [x] `lib/use-cases/purchases/{create,list,get,update,delete,index}.ts`.
- [x] `app/api/purchases/route.ts` (GET with date range + POST), `app/api/purchases/[id]/route.ts` (GET/PATCH/DELETE).
- [x] `lib/api/purchases.ts` — query keys + hooks.
- [x] `app/(dashboard)/bahan/page.tsx` — thin page.
- [x] `components/features/bahan/{bahan-content,bahan-table,bahan-form,bahan-skeleton}.tsx`.
  - Form fields: Tanggal Pembelian, Deskripsi, Vendor (optional), Jumlah (Rp), Rekening, Catatan, Bukti.
  - Table columns: Tanggal, Deskripsi, Vendor, Jumlah, Rekening, Bukti, Aksi.

### 5.2 Gaji (salaries)

- [x] `types/salaries.ts` — `Salary` (BaseEntity + `employeeName`, `amount`, `accountId`, `paidAt`, `period` (string `YYYY-MM`), `receiptUrl?`, `receiptPath?`, `note?`), Zod schemas.
- [x] `lib/repositories/salaries/index.ts` — extends BaseRepository, add `findByPeriod(period)`.
- [x] `lib/use-cases/salaries/{create,list,get,update,delete,index}.ts`.
- [x] `app/api/salaries/route.ts` + `[id]/route.ts`.
- [x] `lib/api/salaries.ts`.
- [x] `app/(dashboard)/gaji/page.tsx` — thin page.
- [x] `components/features/gaji/{gaji-content,gaji-table,gaji-form,gaji-skeleton}.tsx`.
  - Form fields: Tanggal Pembayaran, Nama Karyawan, Periode (month picker → "YYYY-MM"), Jumlah, Rekening, Catatan, Bukti.
  - Table columns: Tanggal, Nama Karyawan, Periode, Jumlah, Rekening, Bukti, Aksi.

### 5.3 Pengeluaran (expenses)

- [x] `types/expenses.ts` — `Expense` (BaseEntity + `category`, `description`, `amount`, `accountId`, `spentAt`, `receiptUrl?`, `receiptPath?`, `note?`), `ExpenseCategory` enum (`"utilities" | "rent" | "transport" | "supplies" | "marketing" | "other"`), Zod schemas.
- [x] `lib/repositories/expenses/index.ts` — extends BaseRepository, add `findByCategory(category, dateRange?)`.
- [x] `lib/use-cases/expenses/{create,list,get,update,delete,index}.ts`.
- [x] `app/api/expenses/route.ts` + `[id]/route.ts`.
- [x] `lib/api/expenses.ts`.
- [x] `app/(dashboard)/pengeluaran/page.tsx` — thin page.
- [x] `components/features/pengeluaran/{pengeluaran-content,pengeluaran-table,pengeluaran-form,pengeluaran-skeleton}.tsx`.
  - Form fields: Tanggal Pengeluaran, Kategori (Select), Deskripsi, Jumlah, Rekening, Catatan, Bukti.
  - Table columns: Tanggal, Kategori (Badge), Deskripsi, Jumlah, Rekening, Bukti, Aksi.

### 5.4 Cross-cutting

- [x] Re-enable the **delete-account guard** in `lib/use-cases/accounts/delete-account.ts` — query `sales`, `purchases`, `salaries`, `expenses` for any reference to the account; throw if found. Update the API route to map this error to `409 Conflict` with an Indonesian message ("Rekening tidak dapat dihapus karena masih memiliki transaksi terkait.").
- [x] Delete placeholder files in `components/features/{bahan,gaji,pengeluaran}/`.
- [x] Update project docs.

## Files to Create/Modify

**Create per resource (3×):**
- `types/{resource}.ts`
- `lib/repositories/{resource}/index.ts`
- `lib/use-cases/{resource}/*.ts`
- `app/api/{resource}/route.ts` + `[id]/route.ts`
- `lib/api/{resource}.ts`
- `components/features/{menu-slug}/*.tsx` (4 files)

**Modify:**
- `app/(dashboard)/{bahan,gaji,pengeluaran}/page.tsx`
- `lib/use-cases/accounts/delete-account.ts` — add transaction reference guard
- `app/api/accounts/[id]/route.ts` — handle 409 Conflict for delete

**Delete placeholders.**

## Docs to Update

- **`docs/01-project-context.md`**:
  - API Routes table: add 12 rows total (4 endpoints × 3 resources, GET + POST + GET[id] + PATCH[id] + DELETE[id], so technically more — match the actual count).
- **`docs/02-architecture.md`**:
  - Folder structure: add all new entries under `types/`, `lib/repositories/`, `lib/use-cases/`, `app/api/`, `lib/api/`, `app/(dashboard)/`, `components/features/`.
- **`docs/03-api-data-flow.md`**:
  - One-line note that `purchases`, `salaries`, `expenses` follow the same vertical-slice pattern as `sales` (Phase 04). No new pattern to document.

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] Each of `/bahan`, `/gaji`, `/pengeluaran` shows the table and form, supports CRUD, and accepts receipt uploads.
- [x] Currency displays as Rupiah; dates in Indonesian; categories and badges use Indonesian labels.
- [x] Receipt upload reuses the shared component without modification.
- [x] Deleting a Rekening that's referenced by any transaction returns a clear Indonesian error message and does NOT delete the account.
- [x] All docs updated.

## Notes

- **Repetition is OK:** This phase intentionally repeats the same vertical-slice pattern 3×. Resist the temptation to abstract a "transaction base" prematurely — each resource has slightly different fields (vendor, period, category) and the repetition is minor compared to the maintenance burden of an abstraction.
- **Period picker for gaji:** Use a simple `<input type="month">` and convert to `YYYY-MM` string. No custom month picker component needed.
- **Expense categories:** Hardcoded enum is fine for MVP. Migrate to a `categories` collection later if user wants custom categories.
- **Storage folders:** Use `purchases-receipts/YYYY/MM/`, `salaries-receipts/YYYY/MM/`, `expenses-receipts/YYYY/MM/` for organization.
- **Delete-account guard performance:** The naive implementation runs 4 separate `count()` queries — fine for MVP. If transaction volumes grow large, refactor to use a denormalized `accountTransactionCount` field updated by a Cloud Function trigger (out of MVP scope).
