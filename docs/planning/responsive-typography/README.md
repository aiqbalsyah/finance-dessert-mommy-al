# Responsive Typography & Spacing

**Goal:** Make all text sizes, gaps, padding, and margins responsive across breakpoints (sm/md/lg/xl/2xl) so the UI scales properly from mobile to 1920px+ screens. Remove custom CSS classes (`section-title`, `section-description`) and use Tailwind responsive utilities instead.

**Status:** ✅ Complete
**Created:** 2026-04-15

## Phases

| # | Phase | Status | Description |
|---|-------|--------|-------------|
| 01 | shared-components | ✅ Done | Remove CSS classes, fix 13 shared components (cards, lists, pipeline) |
| 02 | layouts-and-dashboard | ✅ Done | Fix layout components (page-header, dashboard-content, auth-layout) and dashboard feature sections |
| 03 | remaining-pages | ✅ Done | Fix login, welcome, components-showcase pages + final verification |

Status legend: ⬜ Pending → 🔄 In Progress → ✅ Done → ⏭️ Skipped

## Responsive Scale Reference

These are the target responsive patterns to apply consistently:

| Element | Mobile (default) | sm (640px) | md (768px) | lg (1024px) | xl+ (1280px+) |
|---|---|---|---|---|---|
| Section title | text-lg | text-xl | text-2xl | text-2xl | text-2xl |
| Page title | text-xl | text-2xl | text-3xl | text-3xl | text-3xl |
| Card value (large) | text-2xl | text-2xl | text-3xl | text-3xl | text-3xl |
| Card value (medium) | text-xl | text-xl | text-2xl | text-2xl | text-2xl |
| Item title | text-base | text-base | text-lg | text-lg | text-lg |
| Page padding | p-4 | p-4 | p-6 | p-6 | p-6 |
| Section gap | gap-6 | gap-6 | gap-8 | gap-8 | gap-10 |
| Card inner padding | p-3 | p-4 | p-4 | p-4 | p-4 |
| List item padding | px-4 py-3 | px-4 py-3 | px-6 py-4 | px-6 py-4 | px-6 py-4 |
| Column gap | gap-6 | gap-6 | gap-8 | gap-8 | gap-8 |
