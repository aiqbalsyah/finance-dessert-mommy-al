# Phase 03: Remaining Pages & Verification

**Status:** ✅ Done
**Depends on:** Phase 02

## Goal

Fix responsive typography in login, welcome, and components-showcase pages. Remove any remaining `section-title`/`section-description` references. Final full-project verification.

## Tasks

- [x] Fix `components/features/login/login-form.tsx` — `text-xl` title, `gap-6` form spacing
- [x] Fix `components/features/welcome/welcome-content.tsx` — `text-4xl` title, `text-lg` description, `gap-8`, `p-6`
- [x] Fix `components/features/components-showcase/components-showcase-content.tsx` — `section-title` (18 occurrences), `gap-10`
- [x] Fix `components/features/components-showcase/alert-list-demos.tsx` — `section-title`, `p-6`, `text-lg`, `px-6 py-3`, `gap-10`
- [x] Fix `components/features/components-showcase/status-metric-card-demos.tsx` — `section-title`
- [x] Fix remaining showcase demo files that use `section-title` — none remaining
- [x] Verify NO remaining `section-title` or `section-description` usage in entire codebase (grep) — confirmed zero
- [x] Verify `pnpm build` passes
- [x] Update docs — `docs/04-conventions.md` Typography Scale updated with responsive patterns

## Files to Create/Modify

- `components/features/login/login-form.tsx` — `text-xl` → `text-lg md:text-xl`, `gap-6` → `gap-4 md:gap-6`
- `components/features/welcome/welcome-content.tsx` — `text-4xl` → `text-2xl md:text-4xl`, `text-lg` → `text-base md:text-lg`, `gap-8` → `gap-6 md:gap-8`, `p-6` → `p-4 md:p-6`
- `components/features/components-showcase/components-showcase-content.tsx` — section-title → responsive, `gap-10` → `gap-6 md:gap-8 lg:gap-10`, `space-y-8` → responsive
- `components/features/components-showcase/alert-list-demos.tsx` — section-title → responsive
- `components/features/components-showcase/status-metric-card-demos.tsx` — section-title → responsive
- Any other showcase demo files using `section-title`

## Docs to Update

- `docs/04-conventions.md` — Add "Responsive Typography" section documenting the responsive scale patterns (text sizes at each breakpoint, gap/padding patterns)
- `docs/07-shared-components.md` — Update props/usage notes for components that changed (mention responsive sizing)

## Acceptance Criteria

- [x] `pnpm build` passes
- [x] `grep -r "section-title" components/` returns zero results
- [x] `grep -r "section-description" components/` returns zero results
- [x] `.section-title` and `.section-description` are removed from `globals.css`
- [x] All pages render properly at mobile (375px), tablet (768px), and desktop (1920px) widths
- [x] Login form doesn't look oversized on mobile
- [x] Welcome page title scales properly
- [x] Components showcase sections have responsive headings
- [x] Docs updated with responsive typography conventions

## Notes

- The showcase page has many demo sections — each one wraps demos in a section with a title. All use `section-title` and need converting
- After all changes, do a final `grep` sweep to catch any missed references
- The `globals.css` cleanup (removing the CSS classes) happens in Phase 01, but verification happens here
- Don't change anything in `components/ui/` (shadcn) or `data-center-3d/` (3D visualization)
