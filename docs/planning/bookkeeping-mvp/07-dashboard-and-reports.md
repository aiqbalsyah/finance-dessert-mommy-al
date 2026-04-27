# Phase 07: Dashboard Ringkasan + Laporan

**Status:** ✅ Done
**Depends on:** Phases 02–06 (all collections must exist)

## Goal

Implement the Dashboard summary page (key metrics for today/this month) and the Laporan page (period filter → P&L statement + breakdown by category + top products). After this phase the user can quickly see "berapa omzet hari ini, berapa saldo, produk apa yang paling laku/gak laku" and generate a monthly report.

## Tasks

### Aggregation Use Cases

- [x] Create `lib/use-cases/reports/get-period-summary.ts` — accepts `{ from, to }` (Unix sec for both). Returns:
  - `totalRevenue` (sum of sales.total)
  - `totalPurchases` (sum of purchases.amount)
  - `totalSalaries` (sum of salaries.amount)
  - `totalExpenses` (sum of expenses.amount)
  - `totalOutflow` (sum of all 3 outflows)
  - `netProfit` (totalRevenue − totalOutflow)
  - `salesCount`, `purchasesCount`, `salariesCount`, `expensesCount`
- [x] Create `lib/use-cases/reports/get-account-balances.ts` — returns array of `{ accountId, accountName, accountType, balance, transactionCount }`. Use the `balance` field directly from the accounts collection (no real-time recompute for MVP — assume the user updates it manually OR document that future phase will add auto-update).
- [x] Create `lib/use-cases/reports/get-top-products.ts` — accepts `{ from, to, limit }`. Returns top N products by sales total: `{ productId, productName, totalQty, totalRevenue, salesCount }[]`. Sort desc by `totalRevenue`.
- [x] Create `lib/use-cases/reports/get-top-unsold-products.ts` — same signature as above. Returns top N products by unsold qty: `{ productId, productName, totalUnsoldQty, recordCount }[]`. Sort desc by `totalUnsoldQty`.
- [x] Create `lib/use-cases/reports/get-expense-breakdown.ts` — accepts `{ from, to }`. Returns array of `{ category, total, count }` for expenses, sorted by total desc.
- [x] Create `lib/use-cases/reports/index.ts` — barrel.

### Reports API + Hooks

- [x] Create `app/api/reports/period-summary/route.ts` — `GET ?from=&to=`.
- [x] Create `app/api/reports/account-balances/route.ts` — `GET`.
- [x] Create `app/api/reports/top-products/route.ts` — `GET ?from=&to=&limit=`.
- [x] Create `app/api/reports/top-unsold-products/route.ts` — `GET ?from=&to=&limit=`.
- [x] Create `app/api/reports/expense-breakdown/route.ts` — `GET ?from=&to=`.
- [x] Create `lib/api/reports.ts` — query keys + hooks for all 5 endpoints.

### Dashboard

- [x] Create `components/features/dashboard/dashboard-content.tsx` — replace Phase 01 placeholder with the real dashboard. Layout:
  - Header: "Dashboard" + date range selector (defaults to "Bulan Ini")
  - Top row: 4 `MetricCard` — Omzet, Pengeluaran, Laba Bersih, Saldo Total (sum of all account balances)
  - Second row: `StatusMetricCard` grid — saldo per rekening (one card per account)
  - Third row: 2-column split:
    - Left: top 5 produk laris (`TableCard` or `BorderListCard`)
    - Right: top 5 produk gak laku
  - Fourth row: pengeluaran breakdown by category (`ChartCard` with donut chart)
- [x] Create `components/features/dashboard/dashboard-metrics.tsx` — top 4 metric cards block.
- [x] Create `components/features/dashboard/dashboard-account-balances.tsx` — grid of account balance cards.
- [x] Create `components/features/dashboard/dashboard-top-products.tsx` — left column.
- [x] Create `components/features/dashboard/dashboard-top-unsold.tsx` — right column.
- [x] Create `components/features/dashboard/dashboard-expense-breakdown.tsx` — donut chart.
- [x] Create `components/features/dashboard/dashboard-skeleton.tsx`.
- [x] Create `components/features/dashboard/use-dashboard-period.ts` — small hook wrapping `useState<{from, to}>` with presets ("Hari Ini", "Minggu Ini", "Bulan Ini", "Bulan Lalu", "Custom").

### Laporan

- [x] Replace `app/(dashboard)/laporan/page.tsx` placeholder with thin page.
- [x] Create `components/features/laporan/laporan-content.tsx` — header + period picker + tabbed sections (P&L, Pengeluaran per Kategori, Produk Terlaris, Produk Gak Laku).
- [x] Create `components/features/laporan/laporan-pl.tsx` — P&L statement (table-style summary): Pendapatan / Pembelian Bahan / Gaji / Pengeluaran / Laba Bersih.
- [x] Create `components/features/laporan/laporan-expense-breakdown.tsx` — table + bar chart of expenses by category.
- [x] Create `components/features/laporan/laporan-top-products.tsx` — sorted list with totals.
- [x] Create `components/features/laporan/laporan-top-unsold.tsx` — sorted list with totals.
- [x] Create `components/features/laporan/laporan-period-picker.tsx` — preset buttons + custom date range.
- [x] Create `components/features/laporan/laporan-skeleton.tsx`.
- [x] Delete `components/features/laporan/placeholder-content.tsx`.
- [x] Update project docs.

## Files to Create/Modify

**Create (Reports backend):**
- `lib/use-cases/reports/{get-period-summary,get-account-balances,get-top-products,get-top-unsold-products,get-expense-breakdown,index}.ts`
- `app/api/reports/{period-summary,account-balances,top-products,top-unsold-products,expense-breakdown}/route.ts`
- `lib/api/reports.ts`
- `types/reports.ts` — DTO types for each use case return shape.

**Create (Dashboard):**
- `components/features/dashboard/{dashboard-content,dashboard-metrics,dashboard-account-balances,dashboard-top-products,dashboard-top-unsold,dashboard-expense-breakdown,dashboard-skeleton}.tsx`
- `components/features/dashboard/use-dashboard-period.ts`

**Create (Laporan):**
- `components/features/laporan/{laporan-content,laporan-pl,laporan-expense-breakdown,laporan-top-products,laporan-top-unsold,laporan-period-picker,laporan-skeleton}.tsx`

**Modify:**
- `app/(dashboard)/dashboard/page.tsx` (already thin — confirm it imports `DashboardContent` from the new file).
- `app/(dashboard)/laporan/page.tsx`

**Delete:**
- `components/features/laporan/placeholder-content.tsx`

## Docs to Update

- **`docs/01-project-context.md`**:
  - API Routes table: add 5 reports endpoints.
- **`docs/02-architecture.md`**:
  - Add `lib/use-cases/reports/`, `app/api/reports/`, `lib/api/reports.ts`, `types/reports.ts`, expanded `components/features/dashboard/` (7 files), and `components/features/laporan/` (7 files) — each with one-line comments.
- **`docs/03-api-data-flow.md`**:
  - Add a **"Aggregation queries"** section explaining: aggregations live in `lib/use-cases/reports/` (NOT in repositories), they fetch raw documents from multiple repos and compute totals in memory. Document the trade-off vs. denormalized counters (acceptable for MVP scale; revisit if collections grow > 10k docs).
- **`docs/07-shared-components.md`**:
  - Document any new shared components introduced (likely none — dashboard components are feature-specific).

## Acceptance Criteria

- [x] `pnpm build` passes.
- [x] Dashboard shows 4 top metrics, account balance cards, top products lists, and expense breakdown chart — all in Indonesian, all currency in Rp.
- [x] Period selector on dashboard updates all metrics in sync.
- [x] Laporan page has working preset periods (Hari Ini, Minggu Ini, Bulan Ini, Bulan Lalu) + custom date range.
- [x] P&L tab shows correct math: `Laba Bersih = Pendapatan − (Pembelian Bahan + Gaji + Pengeluaran)`.
- [x] Top products lists are sorted correctly (descending by total revenue / total unsold qty).
- [x] Empty states show when no data in selected period.
- [x] All docs updated.

## Notes

- **Aggregation strategy:** All reports compute on-the-fly from raw transactions. For MVP scale (single SMB, < 10k transactions/year), in-memory aggregation in the use case is fine. Document the trade-off clearly so future refactors know when to denormalize.
- **Account balances:** For MVP, the `balance` field on the account is treated as a static "current saldo" updated manually OR by future automation. Phase 07 simply reads it. A future phase could:
  1. Add Firestore triggers (Cloud Functions) to auto-update balance on every transaction
  2. OR derive balance on-the-fly: `initialBalance + sales(into account) − purchases/salaries/expenses(from account)`
  Pick (1) for accuracy, (2) for simplicity. **Out of MVP scope** — document as known limitation.
- **Recharts:** Existing `ChartCard` from `components/shared/chart-card.tsx` already wraps Recharts. Reuse for the donut and bar charts. Don't introduce a new chart library.
- **Period picker:** A small reusable picker (`laporan-period-picker.tsx`) with preset buttons + a `react-day-picker` range mode satisfies both the dashboard and laporan use cases. Consider promoting to `components/shared/` if the dashboard reuses it (likely yes).
- **Date math:** Use `date-fns` (already installed) — `startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth`, `startOfWeek`, `subMonths`. Convert to Unix sec for API calls.
- **Indonesian month names in headers:** "Laporan April 2026" — use `formatCustom(unixTs, "MMMM yyyy")` with id locale.
- **Performance budget:** All 5 report endpoints should respond < 500ms for the MVP dataset size. If they slow down, add Firestore composite indexes (manually configure via Firebase Console — document the indexes in `docs/03-api-data-flow.md`).
