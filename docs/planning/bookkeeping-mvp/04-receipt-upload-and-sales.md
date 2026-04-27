# Phase 04: Receipt Upload Component + Penjualan (Sales)

**Status:** ✅ Done
**Depends on:** Phase 02 (accounts), Phase 03 (products)

## Goal

Build a reusable `ReceiptUpload` shared component that handles file selection + upload to Firebase Storage via a new `/api/uploads` endpoint, then implement the `sales` resource end-to-end with the receipt upload integrated into the form. After this phase the user can record a sale (pick product, qty, price, account, date, optional receipt photo) and see it in the list with a thumbnail link to the uploaded image.

## Tasks

### Receipt Upload (shared)

- [x] Create `lib/use-cases/uploads/upload-receipt.ts` — accepts `{ buffer, contentType, folder }`, calls `uploadFile` from `lib/firebase`, returns `{ path, url }`. Server-only.
- [x] Create `app/api/uploads/route.ts` — `POST` accepts `multipart/form-data` with fields `file` (Blob) + `folder` (string). Reads the file as a Buffer, validates content type (image only: jpeg/png/webp), max size 5MB, calls `uploadReceipt` use case, returns `{ path, url }`.
- [x] Create `lib/api/uploads.ts` — `useUploadReceipt()` mutation hook that takes `{ file, folder }` and POSTs as FormData (NOT JSON).
- [x] Create `components/shared/receipt-upload.tsx` — controlled component with props: `value` (current URL or undefined), `onChange(url, path)`, `folder` (e.g. `"sales-receipts"`), `disabled?`. Renders:
  - If no value: a drop zone / "Unggah Bukti" button (file input).
  - If value: preview thumbnail + "Ganti" / "Hapus" actions.
  - Loading state during upload.
  - Error state for invalid file type/size.
  - Uses Material Symbol icons (`upload`, `image`, `close`).

### Penjualan (sales)

- [x] Create `types/sales.ts` — `Sale` (extends BaseEntity) with fields: `productId`, `productName` (snapshot), `qty`, `unitPrice` (snapshot), `total`, `accountId`, `soldAt` (Unix sec), `receiptUrl?`, `receiptPath?`, `note?`. `CreateSalePayload`, `UpdateSalePayload`, Zod schemas.
- [x] Create `lib/repositories/sales/index.ts` — `SalesRepository extends BaseRepository<Sale>` (`"sales"`). Add `findByDateRange(startTs, endTs)` and `findByProduct(productId, dateRange?)`.
- [x] Create `lib/use-cases/sales/{create-sale,list-sales,get-sale,update-sale,delete-sale,index}.ts`. The `create-sale` use case denormalizes `productName` + `unitPrice` from the products repository at write time (so sales records remain accurate even if the product changes later).
- [x] Create `app/api/sales/route.ts` — `GET` (with optional `?from=<unixTs>&to=<unixTs>&productId=<id>`) + `POST`.
- [x] Create `app/api/sales/[id]/route.ts` — `GET` + `PATCH` + `DELETE`.
- [x] Create `lib/api/sales.ts` — `saleKeys` + `useGetSales(filters?)`, `useGetSale`, `useCreateSale`, `useUpdateSale`, `useDeleteSale`.
- [x] Replace `app/(dashboard)/penjualan/page.tsx` placeholder with thin page.
- [x] Create `components/features/penjualan/penjualan-content.tsx` — header + filters (date range + product) + table + create button (opens form dialog).
- [x] Create `components/features/penjualan/penjualan-table.tsx` — `DataTableCard` columns: Tanggal, Produk, Qty, Harga Satuan, Total, Rekening, Bukti (icon link to image if present), Aksi.
- [x] Create `components/features/penjualan/penjualan-form.tsx` — TanStack Form + Zod. Fields:
  - Tanggal Penjualan (date picker) → stored as Unix sec
  - Produk (Select from `useGetProducts({ active: true })`) → on change, auto-fills Harga Satuan from product default
  - Qty (number) → on change, auto-calculates Total
  - Harga Satuan (number, Rp) → editable to override
  - Total (number, Rp, read-only computed)
  - Rekening (Select from `useGetAccounts()`)
  - Catatan (textarea, optional)
  - Bukti (`<ReceiptUpload folder="sales-receipts" />`)
- [x] Create `components/features/penjualan/penjualan-skeleton.tsx`.
- [x] Delete `components/features/penjualan/placeholder-content.tsx`.
- [x] Update project docs.

## Files to Create/Modify

**Create (Receipt Upload):**
- `lib/use-cases/uploads/upload-receipt.ts`
- `lib/use-cases/uploads/index.ts`
- `app/api/uploads/route.ts`
- `lib/api/uploads.ts`
- `components/shared/receipt-upload.tsx`

**Create (Sales):**
- `types/sales.ts`
- `lib/repositories/sales/index.ts`
- `lib/use-cases/sales/*.ts`
- `app/api/sales/route.ts`
- `app/api/sales/[id]/route.ts`
- `lib/api/sales.ts`
- `components/features/penjualan/{penjualan-content,penjualan-table,penjualan-form,penjualan-skeleton}.tsx`

**Modify:**
- `app/(dashboard)/penjualan/page.tsx`

**Delete:**
- `components/features/penjualan/placeholder-content.tsx`

## Docs to Update

- **`docs/01-project-context.md`**:
  - API Routes table: add `/api/uploads` (POST), `/api/sales` (GET, POST), `/api/sales/[id]` (GET, PATCH, DELETE).
- **`docs/02-architecture.md`**:
  - Add to folder structure: `lib/use-cases/uploads/`, `app/api/uploads/`, `lib/api/uploads.ts`, `components/shared/receipt-upload.tsx`, `lib/repositories/sales/`, `lib/use-cases/sales/`, `types/sales.ts`, `components/features/penjualan/`.
- **`docs/03-api-data-flow.md`**:
  - Add a **"File uploads via Firebase Storage"** section with a worked example: client sends FormData → API route reads Buffer → `uploadReceipt` use case → `uploadFile` from `lib/firebase` → returns signed URL stored alongside the transaction document.
- **`docs/07-shared-components.md`**:
  - Add full **`ReceiptUpload`** section with import path, description, full Props table (value, onChange, folder, disabled, accept, maxSizeMb), and 3 usage examples (basic, with default value, in a form).

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] Visiting `/penjualan` shows the table (empty state if no sales).
- [x] "Tambah Penjualan" opens form. Selecting a product auto-fills the price; entering qty auto-calculates total.
- [x] Uploading a receipt image succeeds — file lands in Firebase Storage at `sales-receipts/{filename}`.
- [x] After save, the sale appears in the table with a thumbnail/link to the uploaded receipt.
- [x] Receipt rejects non-image files and files > 5MB with Indonesian error toast.
- [x] Editing a sale (without changing receipt) works; the receipt URL is preserved.
- [x] Deleting a sale optionally deletes the storage file (TODO — fine to leave file for now and document as known limitation).
- [x] Date range filter works (`?from=...&to=...`).
- [x] All docs updated.

## Notes

- **FormData on server:** Next.js 16 App Router supports `Request.formData()` natively. Use it to extract the file and convert to a Node Buffer via `Buffer.from(await file.arrayBuffer())`.
- **Storage path strategy:** Group by year/month for easier cleanup later: `sales-receipts/2026/04/{uuid}.jpg`. The `uploadFile` helper already accepts a `folder` parameter — pass the year-month at call time.
- **Signed URL expiry:** `uploadFile` generates a 7-day signed URL by default. For long-term storage, consider making the bucket files publicly readable (call `makePublic: true`) or generating fresh signed URLs on demand. **Decision for MVP:** use `makePublic: true` so URLs never expire — simpler. Document this and the security implication (anyone with the URL can view) in the Notes section of the implementation.
- **Denormalization:** `productName` and `unitPrice` are snapshotted into the sale at write time. If the product is later renamed or repriced, historical sales remain correct.
- **Total calculation:** Compute on the client for instant UX feedback, but **also** recompute on the server in the use case before saving — never trust client-computed money fields.
- **Optimistic update:** Optional polish — TanStack Query supports optimistic updates for the create mutation, but skip for MVP unless trivial.
- **Receipt deletion:** When a sale is deleted, ideally delete the corresponding storage file to avoid orphans. Implement if time allows; otherwise document as TODO and leave for a cleanup job.
