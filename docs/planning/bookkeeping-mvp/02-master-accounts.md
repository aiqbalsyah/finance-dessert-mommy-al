# Phase 02: Master Data — Rekening (Accounts)

**Status:** ✅ Done
**Depends on:** Phase 01

## Goal

Implement the `accounts` resource end-to-end as the **reference vertical slice** for the entire app. Phase 02 sets the pattern (types → repo → use cases → API → hooks → page + features) that Phases 03–06 follow. After this phase, the user can CRUD rekening (bank A/B/C and cash) with a balance field.

## Tasks

- [x] Create `types/accounts.ts` — `Account` interface (extends BaseEntity), `AccountType` (`"bank" | "cash"`), `CreateAccountPayload`, `UpdateAccountPayload`, Zod schemas (`accountCreateSchema`, `accountUpdateSchema`).
- [x] Create `lib/repositories/accounts/index.ts` — `AccountsRepository extends BaseRepository<Account>` with collection name `"accounts"`. Add custom method `findByCode(code)` if needed.
- [x] Create `lib/use-cases/accounts/create-account.ts` — validates payload via Zod, calls `accountsRepository.create`.
- [x] Create `lib/use-cases/accounts/list-accounts.ts` — `accountsRepository.findAll({ orderBy: { field: "name", direction: "asc" } })`.
- [x] Create `lib/use-cases/accounts/get-account.ts` — `findById`, throws if not found.
- [x] Create `lib/use-cases/accounts/update-account.ts` — validates, calls `update`.
- [x] Create `lib/use-cases/accounts/delete-account.ts` — guards against deleting an account referenced by any transaction (skip the guard for now if it complicates Phase 02 — re-enable in Phase 05 once transactions exist).
- [x] Create `lib/use-cases/accounts/index.ts` — barrel export.
- [x] Create `app/api/accounts/route.ts` — `GET` (list) + `POST` (create).
- [x] Create `app/api/accounts/[id]/route.ts` — `GET` (single) + `PATCH` (update) + `DELETE`.
- [x] Create `lib/api/accounts.ts` — `accountKeys` query key factory + `useGetAccounts`, `useGetAccount(id)`, `useCreateAccount`, `useUpdateAccount`, `useDeleteAccount` hooks (TanStack Query).
- [x] Create `app/(dashboard)/rekening/page.tsx` — thin import + render of `RekeningContent`.
- [x] Create `components/features/rekening/rekening-content.tsx` — `"use client"`, header + table + form drawer/dialog. Manages selected account state for edit.
- [x] Create `components/features/rekening/rekening-table.tsx` — uses `DataTableCard`. Columns: Nama, Kode, Tipe (Bank/Cash badge), Saldo (formatCurrency), Aksi (edit/hapus dropdown).
- [x] Create `components/features/rekening/rekening-form.tsx` — TanStack Form + Zod, fields: Nama, Kode (optional, e.g. "A"), Tipe (Select: Bank/Cash), Saldo Awal. Submits via mutation hooks. Used inside Dialog/Sheet for both create and edit.
- [x] Create `components/features/rekening/rekening-skeleton.tsx` — table + form loading state.
- [x] Update project docs (see "Docs to Update" below).

## Files to Create/Modify

**Create:**
- `types/accounts.ts`
- `lib/repositories/accounts/index.ts`
- `lib/use-cases/accounts/{create-account,list-accounts,get-account,update-account,delete-account,index}.ts`
- `app/api/accounts/route.ts`
- `app/api/accounts/[id]/route.ts`
- `lib/api/accounts.ts`
- `app/(dashboard)/rekening/page.tsx`
- `components/features/rekening/{rekening-content,rekening-table,rekening-form,rekening-skeleton}.tsx`

**Modify:**
- Replace `app/(dashboard)/rekening/page.tsx` placeholder from Phase 01 with the real thin page.
- Remove `components/features/rekening/placeholder-content.tsx`.

## Docs to Update

- **`docs/01-project-context.md`**:
  - **API Routes table**: Add full rows:
    - `/api/accounts` — `GET` — Daftar semua rekening
    - `/api/accounts` — `POST` — Tambah rekening baru
    - `/api/accounts/[id]` — `GET` — Detail satu rekening
    - `/api/accounts/[id]` — `PATCH` — Ubah rekening
    - `/api/accounts/[id]` — `DELETE` — Hapus rekening
- **`docs/02-architecture.md`**:
  - **Folder structure**: Add full entries under `lib/repositories/`, `lib/use-cases/`, `app/api/`, `lib/api/`, `app/(dashboard)/`, `components/features/`, and `types/` (each with descriptive comment).
  - **Features section**: Add `components/features/rekening/` with each file and one-line comment per file.
- **`docs/03-api-data-flow.md`**:
  - Add a worked example section "Example: accounts resource" showing the full vertical slice (types → repo → use case → API route → hook → component) using the actual code paths. This becomes the canonical reference for Phases 03–06.
- **`docs/07-shared-components.md`**:
  - No new shared components in this phase — but if any new generic patterns emerged (e.g. a `ResourceCrudShell` wrapper), document them. Otherwise skip.

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] Visiting `/rekening` shows the table; "Tambah Rekening" opens a dialog/sheet with the form.
- [x] Creating a new account writes to Firestore (confirm via Firebase Console).
- [x] Editing and deleting works; table refreshes (TanStack Query cache invalidation).
- [x] Currency displays as `Rp 1.500.000` (Indonesian formatting).
- [x] Form validation errors show in Indonesian (Zod messages must be Indonesian or use Indonesian fallback).
- [x] Skeleton shows on first load; error state shows on API failure.
- [x] All listed docs updated with comprehensive detail.

## Notes

- **Firestore collection name:** `"accounts"` — matches repository constructor argument exactly.
- **Balance handling:** `balance` is a number in Rupiah (whole rupiah, no decimals — Indonesian currency doesn't use sub-units in practice). Store as integer.
- **Code field:** Optional short code like "A", "B", "C" for quick identification. Useful in dropdowns later when picking the source/destination account.
- **Account type:** Just `"bank" | "cash"`. The user said "Rekening A, B, C, dan Cash" — A/B/C are bank accounts, "Cash" is cash. The `code` field disambiguates within type.
- **Delete guard deferred:** Real-world apps prevent deleting an account with transactions. We defer this until Phase 05 (when transactions exist) to keep Phase 02 simple. Document the TODO inline.
- **Pattern reference:** Other resources in Phases 03–06 should mirror this phase's file structure 1:1 — same naming (`{resource}-content.tsx`, `{resource}-table.tsx`, `{resource}-form.tsx`, `{resource}-skeleton.tsx`).
- **Initial seed data:** Optionally add a seed script `scripts/seed-accounts.mjs` that creates 4 default accounts (Rekening A, B, C, Cash). Useful for local testing — don't run in production.
