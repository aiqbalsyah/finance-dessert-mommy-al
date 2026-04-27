# Phase 01: Shared Components

**Status:** ✅ Done
**Depends on:** None

## Goal

Remove the hardcoded `section-title` and `section-description` CSS classes from `globals.css` and replace all usages across shared components with responsive Tailwind utilities. Fix all text sizes, gaps, and padding in shared card/list components.

## Tasks

- [x] Remove `.section-title` and `.section-description` from `app/globals.css` `@layer components`
- [x] Fix `components/shared/chart-card.tsx` — replace `section-title` with responsive Tailwind classes
- [x] Fix `components/shared/data-table-card.tsx` — replace `section-title` with responsive Tailwind classes, fix pagination padding
- [x] Fix `components/shared/table-card.tsx` — replace `section-title` with responsive Tailwind classes, fix pagination padding
- [x] Fix `components/shared/pipeline-card.tsx` — replace `section-title`, fix `text-3xl`, `p-6`, `gap-6`
- [x] Fix `components/shared/analysis-pipeline-card.tsx` — replace `section-title`, fix `text-lg`, `p-6`
- [x] Fix `components/shared/metric-card.tsx` — fix `text-3xl` value
- [x] Fix `components/shared/status-metric-card.tsx` — fix `text-2xl` value
- [x] Fix `components/shared/insight-card.tsx` — fix `text-lg` title, `p-6` padding
- [x] Fix `components/shared/timeline-list-card.tsx` — replace `section-title`, fix `text-lg`, `px-6 py-4`
- [x] Fix `components/shared/expanded-list-card.tsx` — fix `text-lg`, `px-6 py-6`
- [x] Fix `components/shared/recent-activity-card.tsx` — replace `section-title`, fix `text-lg`, `px-6 py-4`
- [x] Fix `components/shared/insight-list-card.tsx` — replace `section-title`, fix `text-lg`, `px-6 py-4`
- [x] Fix `components/shared/activity-log-card.tsx` — replace `section-title`, fix `text-lg`, `px-6 py-6`
- [x] Fix `components/shared/border-list-card.tsx` — fix `text-lg`, `p-6`
- [x] Verify `pnpm build` passes

## Files to Create/Modify

- `app/globals.css` — remove `.section-title` and `.section-description` from `@layer components`
- `components/shared/chart-card.tsx` — section-title → responsive Tailwind
- `components/shared/data-table-card.tsx` — section-title → responsive Tailwind, pagination padding
- `components/shared/table-card.tsx` — section-title → responsive Tailwind, pagination padding
- `components/shared/pipeline-card.tsx` — section-title, text-3xl, p-6, gap-6
- `components/shared/analysis-pipeline-card.tsx` — section-title, text-lg, p-6
- `components/shared/metric-card.tsx` — text-3xl
- `components/shared/status-metric-card.tsx` — text-2xl
- `components/shared/insight-card.tsx` — text-lg, p-6
- `components/shared/timeline-list-card.tsx` — section-title, text-lg, px-6 py-4
- `components/shared/expanded-list-card.tsx` — text-lg, px-6 py-6
- `components/shared/recent-activity-card.tsx` — section-title, text-lg, px-6 py-4
- `components/shared/insight-list-card.tsx` — section-title, text-lg, px-6 py-4
- `components/shared/activity-log-card.tsx` — section-title, text-lg, px-6 py-6
- `components/shared/border-list-card.tsx` — text-lg, p-6

## Replacement Patterns

For all files, apply these responsive replacements:

**Section titles** (was `section-title`):
```
font-heading text-lg font-semibold md:text-2xl
```

**Section descriptions** (was `section-description`):
```
text-xs text-muted-foreground
```
(Already small — no change needed, just use inline Tailwind)

**Large card values** (was `text-3xl`):
```
text-2xl font-semibold md:text-3xl
```

**Medium card values** (was `text-2xl`):
```
text-xl font-semibold md:text-2xl
```

**Item titles** (was `text-lg`):
```
text-base font-semibold md:text-lg
```

**Card padding** (was `p-6`):
```
p-4 md:p-6
```

**List item padding** (was `px-6 py-4` or `px-6 py-6`):
```
px-4 py-3 md:px-6 md:py-4
```

## Acceptance Criteria

- [x] `pnpm build` passes
- [x] No remaining references to `section-title` or `section-description` in shared components
- [x] `.section-title` and `.section-description` removed from globals.css
- [x] All shared components use responsive text sizes with `md:` breakpoint
- [x] Card padding scales down on mobile

## Notes

- `section-description` is already `text-xs` which is fine at all sizes — just replace the CSS class with inline `text-xs text-muted-foreground`
- `section-title` uses `font-heading` (Roboto Condensed) — keep that font-family, just make size responsive
- Some components like `chart-card` and `data-table-card` accept `title`/`description` props and render the section header internally — the fix is inside the component, not the consumer
- Don't touch `components/ui/` (shadcn) or `data-center-3d/` (3D viz) files
