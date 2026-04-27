# Phase 06: Barang Tidak Terjual (Unsold Items)

**Status:** ✅ Done
**Depends on:** Phase 03 (products)

> **Renamed mid-phase:** menu was originally proposed as "Barang Gak Laku" but renamed to "Barang Tidak Terjual" (formal Indonesian). Route slug, folder name, and component identifiers all updated to match.

## Goal

Implement the `unsold_items` resource — manual daily input of how many of each product were unsold on a given date. Unlike the transaction resources, there's no money or receipt involved; the user simply records "produk X, qty Y, tanggal Z, alasan opsional". The dashboard (Phase 07) reads this collection to show "top produk gak laku".

## Tasks

- [x] Create `types/unsold-items.ts` — `UnsoldItem` (BaseEntity + `productId`, `productName` (snapshot), `qty`, `date` (string `YYYY-MM-DD` — date-only, no time), `reason?` (`"expired" | "damaged" | "leftover" | "other"`), `note?`), Zod schemas.
- [x] Create `lib/repositories/unsold-items/index.ts` — extends BaseRepository (collection `"unsold_items"`). Add `findByDateRange(startDate, endDate)` and `findByProduct(productId, dateRange?)`. Note dates are stored as strings here (YYYY-MM-DD) for simpler day-bucketed queries — different from transaction resources which use Unix timestamps.
- [x] Create `lib/use-cases/unsold-items/{create-unsold-item,list-unsold-items,get-unsold-item,update-unsold-item,delete-unsold-item,index}.ts`. The create use case denormalizes `productName` from products at write time.
- [x] Create `app/api/unsold-items/route.ts` — `GET` (with optional `?from=YYYY-MM-DD&to=YYYY-MM-DD&productId=<id>`) + `POST`.
- [x] Create `app/api/unsold-items/[id]/route.ts` — `GET` + `PATCH` + `DELETE`.
- [x] Create `lib/api/unsold-items.ts` — query keys + hooks.
- [x] Replace `app/(dashboard)/barang-gak-laku/page.tsx` placeholder with thin page.
- [x] Create `components/features/barang-gak-laku/barang-gak-laku-content.tsx` — header + date range filter + table + form dialog.
- [x] Create `components/features/barang-gak-laku/barang-gak-laku-table.tsx` — `DataTableCard` columns: Tanggal, Produk, Qty, Alasan (Badge), Catatan, Aksi.
- [x] Create `components/features/barang-gak-laku/barang-gak-laku-form.tsx` — TanStack Form + Zod. Fields:
  - Tanggal (date picker → YYYY-MM-DD string, defaults to today)
  - Produk (Select from `useGetProducts({ active: true })`)
  - Qty (integer ≥ 1)
  - Alasan (Select with: Kadaluarsa, Rusak, Sisa, Lainnya)
  - Catatan (textarea, optional)
- [x] Create `components/features/barang-gak-laku/barang-gak-laku-skeleton.tsx`.
- [x] Delete `components/features/barang-gak-laku/placeholder-content.tsx`.
- [x] Update project docs.

## Files to Create/Modify

**Create:**
- `types/unsold-items.ts`
- `lib/repositories/unsold-items/index.ts`
- `lib/use-cases/unsold-items/*.ts`
- `app/api/unsold-items/route.ts`
- `app/api/unsold-items/[id]/route.ts`
- `lib/api/unsold-items.ts`
- `components/features/barang-gak-laku/{barang-gak-laku-content,barang-gak-laku-table,barang-gak-laku-form,barang-gak-laku-skeleton}.tsx`

**Modify:**
- `app/(dashboard)/barang-gak-laku/page.tsx`

**Delete:**
- `components/features/barang-gak-laku/placeholder-content.tsx`

## Docs to Update

- **`docs/01-project-context.md`**:
  - API Routes table: add `/api/unsold-items` (GET, POST) and `/api/unsold-items/[id]` (GET, PATCH, DELETE).
- **`docs/02-architecture.md`**:
  - Add `types/unsold-items.ts`, `lib/repositories/unsold-items/`, `lib/use-cases/unsold-items/`, `app/api/unsold-items/`, `lib/api/unsold-items.ts`, `components/features/barang-gak-laku/` to the folder structure.
- **`docs/03-api-data-flow.md`**:
  - Add a short note explaining the date storage difference: transaction resources use Unix timestamps (sortable, supports time-of-day) while `unsold_items` uses `YYYY-MM-DD` strings (day-level only, easy GROUP BY date).
- **`docs/04-conventions.md`**:
  - Optional: document the dual date storage pattern (Unix sec for time-precise events, YYYY-MM-DD string for day-level events) under Data Conventions.

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] `/barang-gak-laku` shows the list (empty state if none).
- [x] User can add an unsold record: pick date, pick product, enter qty, pick reason, optional note.
- [x] Date defaults to today; user can backdate up to 30 days (validation hint, not hard block).
- [x] Edit and delete work.
- [x] Date range filter works.
- [x] Reason badges display in Indonesian (Kadaluarsa, Rusak, Sisa, Lainnya).
- [x] All docs updated.

## Notes

- **Date as string:** Storing `date` as `YYYY-MM-DD` string (instead of Unix sec) makes "all unsold items on 2026-04-15" trivial: `where("date", "==", "2026-04-15")`. With Unix timestamps, the same query needs a range scan covering the full day. For day-level events with no time component, strings are simpler and queries are cleaner.
- **No receipt upload:** Unsold items are an internal count — no payment, no receipt. The form is much simpler than the transaction forms.
- **Multiple records per day per product allowed:** Don't enforce uniqueness on `(productId, date)` at the DB level. The user might log multiple batches throughout the day. The dashboard aggregates them.
- **Reason taxonomy:** Keep the 4 reasons hardcoded for MVP. If user wants custom reasons, add a `reasons` collection later (out of scope).
- **No cross-reference to sales:** The user explicitly said unsold input is independent — we do NOT auto-compute or cross-validate against sales. If they say "10 unsold" but only sold 2 today and produced 5 total, we trust the user's input. Production tracking is out of MVP scope.
