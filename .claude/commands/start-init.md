# CERBREC-UI: Start Init — Read all docs and scan codebase

You are starting a fresh session on this project. Follow these steps to fully understand the codebase before doing any work.

## Step 1: Read All Documentation

Read these docs in order to understand the project conventions, architecture, and patterns:

1. `docs/01-project-context.md` — Tech stack, fonts, env vars, routes, API routes
2. `docs/02-architecture.md` — Folder structure, component architecture, providers, auth system
3. `docs/03-api-data-flow.md` — API hooks, services, auth context, component pattern
4. `docs/04-conventions.md` — Naming, shadcn notes, TypeScript, state, data fetching
5. `docs/05-forms.md` — TanStack Form + Zod + shadcn/ui patterns
6. `docs/06-data-table.md` — TanStack Table, DataTableCard, shared components, table styling
7. `docs/07-shared-components.md` — All shared components: usage, props, examples
8. `docs/08-3d-visualization.md` — R3F setup, Scene3D, grid positioning, equipment patterns
9. `docs/3d/component-architecture.md` — LayoutRenderer, Room, equipment units
10. `docs/3d/grid-positioning-rules.md` — Coordinate system, layer heights, rotation

## Step 2: Scan Project Structure

Run `ls` on key directories to understand the current state:

- `app/` — pages, layouts, API routes
- `components/features/` — page-specific components
- `components/shared/` — reusable shared components
- `components/layouts/` — layout components
- `lib/services/` — backend service calls
- `api/` — TanStack Query hooks
- `types/` — TypeScript interfaces

## Step 3: Check Active Plans

Check if `docs/planning/` exists and has active plans. If so, read each `README.md` for status.

## Step 4: Verify Build Health

Run `pnpm build 2>&1 | tail -20` to check if the project builds cleanly. If there are errors, note them for the user.

## Step 5: Report Ready

After completing all steps, give the user a brief summary:

- Confirm you've read all docs and understand the conventions
- Report the build status (clean or any errors found)
- List the current pages/features in the app
- List any active plans and their progress (if any)
- Remind key architecture rules:
  - Pages are thin → content in `components/features/`
  - Layouts are thin → content in `components/layouts/`
  - API routes are thin → logic in `lib/services/`
  - Types in `types/` — never inline
  - Shared components in `components/shared/` — not in `components/ui/`
- Ask what they'd like to work on
