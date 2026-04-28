# Phase 07: Audit Trail (createdBy / updatedBy on Transactions)

**Status:** ✅ Done
**Depends on:** Phase 03 (`getCurrentUser`), Phase 04 (routes have access to current user via `withAuth` callback)

## Goal

Track WHO created and last edited each transaction document by adding optional `createdBy` and `updatedBy` fields (each = `{ userId, userName }` snapshot) to `BaseEntity`. Inject the current user from API routes into use cases on every create/update. Surface the info in the UI (table tooltip, optional detail view).

## Tasks

- [x] Update `lib/repositories/base-repository.ts`:
  - Extend `BaseEntity` interface with optional fields:
    ```ts
    export interface BaseEntity {
      id: string
      createdAt: number
      updatedAt: number
      createdBy?: { userId: string; userName: string }
      updatedBy?: { userId: string; userName: string }
    }
    ```
  - **Don't** modify `BaseRepository.create()` / `update()` to auto-inject — keep the repository pure (no auth coupling). Use cases will pass these fields explicitly via the payload.
- [x] Update each create-* use case (sales, purchases, salaries, expenses, unsold-items, products, accounts) — change signature to take a second arg:
  ```ts
  export async function createSale(
    payload: CreateSalePayload,
    actor: { userId: string; userName: string }
  ): Promise<Sale>
  ```
  - Inside, pass `createdBy: actor, updatedBy: actor` to repository.
- [x] Same for each update-* use case — add `actor` arg, pass `updatedBy: actor` to repository.
- [x] Update each create/update API route handler to extract user from `withAuth` callback's `user` arg and pass into use case:
  ```ts
  export const POST = withAuth(async (request, ctx, user) => {
    const body = await request.json()
    const data = await createSale(body, { userId: user.id, userName: user.displayName })
    return Response.json(data, { status: 201 })
  }, { permission: "sales:create" })
  ```
- [x] Apply across all 7 transaction/master resources × 2 actions (create/update) = 14 changes. Mostly mechanical.
- [x] Update tables to show audit info — add a tooltip on the row (or a new column if user wants visibility). Recommended: **hover tooltip on `Tanggal` column** showing "Dibuat oleh {userName} • {formatRelativeTime(createdAt)}" + "Diubah oleh {userName} • {formatRelativeTime(updatedAt)}" if updatedBy exists and differs from createdBy.
  - Use shadcn `<Tooltip>` from `@/components/ui/tooltip`.
  - Apply to all 7 transaction tables (sales, purchases, salaries, expenses, unsold-items, products, accounts).
- [x] Update project docs.

## Files to Create/Modify

**Modify:**
- `lib/repositories/base-repository.ts` — extend `BaseEntity`.
- `lib/use-cases/sales/{create-sale,update-sale}.ts` — add actor param.
- `lib/use-cases/purchases/index.ts` — same.
- `lib/use-cases/salaries/index.ts` — same.
- `lib/use-cases/expenses/index.ts` — same.
- `lib/use-cases/unsold-items/index.ts` — same.
- `lib/use-cases/products/{create-product,update-product}.ts` — same.
- `lib/use-cases/accounts/{create-account,update-account}.ts` — same.
- All matching API route handlers (~14 handlers).
- All `*-table.tsx` components (~7) — add tooltip.

## Docs to Update

- **`docs/02-architecture.md`**:
  - Update Auth System section: mention audit trail. Note that `BaseEntity` now has optional `createdBy`/`updatedBy`.
- **`docs/03-api-data-flow.md`**:
  - Add a new subsection **"Audit trail (createdBy / updatedBy)"** under Repositories or Use Cases section. Show the use-case signature pattern with the `actor` second arg, and the API-route pattern (extract from `withAuth` callback). Explain the convention: write actions snapshot the actor; reads are not audited.
- **`docs/04-conventions.md`**:
  - Under Data Conventions: document `createdBy`/`updatedBy` shape (`{ userId, userName }` denormalized snapshot). Explain the rationale for snapshot vs FK lookup: name preserved even after user deletion/rename.

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] Creating a new sale as Admin → check Firestore: doc has `createdBy: { userId: "...", userName: "Admin" }` + `updatedBy: { ...same... }`.
- [x] Editing the sale as Manager → `createdBy` unchanged, `updatedBy` becomes the manager's info.
- [x] Hovering the Tanggal column in any transaction table shows "Dibuat oleh X • 5 menit yang lalu" tooltip.
- [x] If a transaction was edited, tooltip also shows "Diubah oleh Y • 2 menit yang lalu".
- [x] Old transactions (without `createdBy` field) render normally — tooltip shows "—" or skips the audit lines gracefully.
- [x] All docs updated.

## Notes

- **Snapshot vs FK:** storing `{ userId, userName }` instead of just `userId` means the table renders without a JOIN/lookup, AND the name is preserved even if the user is later renamed or deleted. Trade-off: rename doesn't propagate to old records (acceptable for audit; you DO want historical accuracy for "who did this when").
- **Why pass `actor` explicitly to use cases instead of using `getCurrentUser()` inside?** Use cases stay pure — easier to test (just pass a mock actor), no implicit dependency on request context. The API route is the boundary that knows about HTTP/auth.
- **Don't audit reads:** would explode storage and provide little value for an SMB app. If you need read audit later (compliance), add a separate `audit_log` collection (out of scope).
- **Migration of existing rows:** all docs created before this phase have no `createdBy`. UI code must handle `undefined` gracefully — the tooltip lines just don't render. Don't backfill (no way to know who did it). Document as known limitation.
- **Repository purity rule:** the repository never knows about the current user. The use case is the layer that knows. The API route is the layer that has the request context. Keeping these separate makes each layer testable.
- **`actor` shape choice:** could be just `userId: string` if you want minimal storage. But denormalizing `userName` saves a join on every render. For a 7-collection SMB app, the extra ~30 bytes per doc is fine.
- **Don't audit `auth-token` cookie reads or `/api/auth/me` calls** — already handled (they're not "actions" in the audit sense, just session checks).
- **Optional polish:** if you later want a "Recent Activity" widget on the dashboard ("Sale by X 2 min ago"), this audit data is exactly what powers it. Out of scope for this phase but worth noting.
