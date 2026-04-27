# Phase 03: Master Data — Master Produk (Products)

**Status:** ✅ Done
**Depends on:** Phase 02

## Goal

Implement the `products` resource — master list of dessert items with name, default price, category, and active flag. Mirrors the Phase 02 pattern. Products are referenced by Penjualan (Phase 04) and Barang Gak Laku (Phase 06).

## Tasks

- [x] Create `types/products.ts` — `Product` (extends BaseEntity), `ProductCategory` (`"cake" | "cookie" | "pastry" | "drink" | "other"` — keep simple, extensible later), `CreateProductPayload`, `UpdateProductPayload`, Zod schemas.
- [x] Create `lib/repositories/products/index.ts` — `ProductsRepository extends BaseRepository<Product>` with `"products"` collection. Add `findActive()` shortcut.
- [x] Create `lib/use-cases/products/{create-product,list-products,get-product,update-product,delete-product,index}.ts` — same pattern as Phase 02.
- [x] Create `app/api/products/route.ts` — `GET` (with optional `?active=true` query) + `POST`.
- [x] Create `app/api/products/[id]/route.ts` — `GET` + `PATCH` + `DELETE`.
- [x] Create `lib/api/products.ts` — `productKeys` + `useGetProducts({ active? })`, `useGetProduct`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct`.
- [x] Replace `app/(dashboard)/master-produk/page.tsx` placeholder with thin page importing `MasterProdukContent`.
- [x] Create `components/features/master-produk/master-produk-content.tsx` — `"use client"`, header + table + form dialog.
- [x] Create `components/features/master-produk/master-produk-table.tsx` — `DataTableCard`. Columns: Nama, Kategori (Badge), Harga (formatCurrency), Status (Aktif/Tidak Aktif badge), Aksi.
- [x] Create `components/features/master-produk/master-produk-form.tsx` — TanStack Form + Zod. Fields: Nama, Kategori (Select), Harga (number input with Rp prefix), Status Aktif (Switch). Used in Dialog/Sheet for create and edit.
- [x] Create `components/features/master-produk/master-produk-skeleton.tsx`.
- [x] Delete `components/features/master-produk/placeholder-content.tsx`.
- [x] Update project docs.

## Files to Create/Modify

**Create:**
- `types/products.ts`
- `lib/repositories/products/index.ts`
- `lib/use-cases/products/*.ts`
- `app/api/products/route.ts`
- `app/api/products/[id]/route.ts`
- `lib/api/products.ts`
- `components/features/master-produk/{master-produk-content,master-produk-table,master-produk-form,master-produk-skeleton}.tsx`

**Modify:**
- `app/(dashboard)/master-produk/page.tsx` — replace placeholder.

**Delete:**
- `components/features/master-produk/placeholder-content.tsx`

## Docs to Update

- **`docs/01-project-context.md`**:
  - **API Routes table**: Add `/api/products` (GET, POST) and `/api/products/[id]` (GET, PATCH, DELETE) rows with descriptions in Indonesian.
- **`docs/02-architecture.md`**:
  - Add `lib/repositories/products/`, `lib/use-cases/products/`, `app/api/products/`, `lib/api/products.ts`, `types/products.ts`, and `components/features/master-produk/` entries with descriptive comments per file.
- **`docs/03-api-data-flow.md`**:
  - The "Example: accounts resource" section from Phase 02 covers this — no new pattern. Optionally add a one-line note that `products` follows the same pattern.

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] `/master-produk` lists products (empty state if none).
- [x] Create form opens, validates, saves; table refreshes.
- [x] Edit and delete work.
- [x] Inactive products show with "Tidak Aktif" badge and are filterable in the table.
- [x] Currency displays as Rupiah; category as colored badge.
- [x] All docs updated.

## Notes

- **Category enum:** Start with 5 values; if user wants free-text categories later, migrate to a `categories` collection (out of scope for MVP).
- **Price storage:** Integer Rupiah, no decimals.
- **Active flag:** Soft "delete" alternative — set `isActive=false` to hide from sales picker without losing historical references.
- **Sale references:** Sales records will store `productId` AND a snapshot of `productName` + `unitPrice` so historical reports remain accurate even if the product is renamed/deleted later. Document this denormalization in Phase 04.
