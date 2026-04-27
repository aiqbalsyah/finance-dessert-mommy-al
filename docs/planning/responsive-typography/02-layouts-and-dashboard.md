# Phase 02: Layouts & Dashboard

**Status:** ✅ Done
**Depends on:** Phase 01

## Goal

Fix responsive typography and spacing in layout components (page-header, dashboard-layout, auth-layout) and dashboard feature sections (overview metrics, alerts, infrastructure, activity).

## Tasks

- [x] Fix `components/layouts/dashboard/page-header.tsx` — `text-3xl` page title → responsive
- [x] Fix `components/layouts/dashboard/dashboard-header.tsx` — verified, already small text, no changes needed
- [x] Fix `components/layouts/auth/auth-layout.tsx` — verified, already has `p-6 md:p-10`, no changes needed
- [x] Fix `components/features/dashboard/dashboard-content.tsx` — `p-6`, `gap-8`, `gap-10` → responsive
- [x] Fix `components/features/dashboard/dashboard-overview-metrics.tsx` — `section-title`, `text-3xl` metric values
- [x] Fix `components/features/dashboard/dashboard-alerts.tsx` — `section-title`, `text-lg` titles, `p-6` padding, `gap-10`
- [x] Fix `components/features/dashboard/dashboard-infrastructure.tsx` — `section-title` → responsive
- [x] Fix `components/features/dashboard/dashboard-activity.tsx` — verified, uses RecentActivityCard (already fixed in Phase 01)
- [x] Verify `pnpm build` passes

## Files to Create/Modify

- `components/layouts/dashboard/page-header.tsx` — `text-3xl` → `text-2xl md:text-3xl`, font-heading kept
- `components/layouts/auth/auth-layout.tsx` — verify `p-6 md:p-10` pattern, adjust gap
- `components/features/dashboard/dashboard-content.tsx` — `p-6` → `p-4 md:p-6`, `gap-8` → `gap-6 md:gap-8`, `gap-10` → `gap-6 md:gap-8 lg:gap-10`
- `components/features/dashboard/dashboard-overview-metrics.tsx` — section-title → responsive, `text-3xl` → responsive
- `components/features/dashboard/dashboard-alerts.tsx` — section-title → responsive, `text-lg` → responsive, `p-6` → responsive
- `components/features/dashboard/dashboard-infrastructure.tsx` — section-title → responsive
- `components/features/dashboard/dashboard-activity.tsx` — verify and fix as needed

## Replacement Patterns

Same patterns as Phase 01, plus:

**Page title** (page-header, was `text-3xl font-heading`):
```
font-heading text-2xl font-semibold md:text-3xl
```

**Dashboard page padding** (was `p-6`):
```
p-4 md:p-6
```

**Dashboard section gap** (was `gap-10`):
```
gap-6 md:gap-8 lg:gap-10
```

**Dashboard column gap** (was `gap-8`):
```
gap-6 md:gap-8
```

**Alert item padding** (was `p-6`):
```
p-4 md:p-6
```

## Acceptance Criteria

- [x] `pnpm build` passes
- [x] No remaining `section-title` class in dashboard features
- [x] Dashboard layout scales properly: tighter spacing on mobile, original spacing at lg+
- [x] Page header title is responsive
- [x] Dashboard two-column layout still works correctly at lg breakpoint

## Notes

- `dashboard-content.tsx` has `lg:flex-row` and `lg:w-alerts-sidebar` — keep these, only add responsive padding/gap
- The `DashboardHeader` (sticky header bar) is already small text — mainly verify, don't over-change
- `auth-layout.tsx` already has `p-6 md:p-10` — it's a good reference for the pattern
