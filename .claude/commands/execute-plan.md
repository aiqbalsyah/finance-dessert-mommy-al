# CERBREC-UI: Execute Plan — Run next pending phase, verify build, mark progress

Execute the next pending phase from a plan in `docs/planning/`.

## Step 0: Read Project Docs (MANDATORY)

**Before writing ANY code**, you MUST read these docs to understand the architecture:

1. `docs/02-architecture.md` — folder structure, component placement rules
2. `docs/04-conventions.md` — naming, shadcn notes, TypeScript, data fetching patterns
3. `CLAUDE.md` — key rules quick reference

Read additional docs based on what the phase involves:
- Creating pages → also read `docs/01-project-context.md`
- Creating API resources → also read `docs/03-api-data-flow.md`
- Creating shared components → also read `docs/07-shared-components.md`
- Creating forms → also read `docs/05-forms.md`
- Creating data tables → also read `docs/06-data-table.md`
- Creating 3D components → also read `docs/08-3d-visualization.md`

## Step 1: Load Plan

The user may provide a plan name as argument: `/execute-plan {plan-name}`

If no argument:
1. List all plans in `docs/planning/` by reading each `README.md`
2. Show their status (phases completed / total)
3. Ask the user which plan to continue

## Step 2: Find Next Phase

1. Read the plan's `README.md` to find the first phase with status ⬜ Pending
2. Read that phase file (e.g., `01-types-and-models.md`)
3. Show the user:
   - Phase number and title
   - Goal
   - Task list
   - Files to create/modify
4. Ask: **"Ready to execute this phase?"** — wait for confirmation

## Step 3: Execute

1. Update the phase status to 🔄 In Progress in both:
   - The phase file (`**Status:** 🔄 In Progress`)
   - The `README.md` table
2. Execute each task in the task list:
   - Check off tasks as they're completed (`- [x]`)
   - Follow all project conventions from CLAUDE.md and docs
   - Use `/create-page`, `/create-api`, `/create-component` patterns where applicable
3. After all tasks are done, verify against Acceptance Criteria:
   - Run `pnpm build 2>&1 | tail -20` — must pass
   - Check each acceptance criterion
   - Check off criteria as verified (`- [x]`)

## Step 4: Complete Phase

1. Update phase status to ✅ Done in both:
   - The phase file (`**Status:** ✅ Done`)
   - The `README.md` table

2. Update project docs — comprehensive and detailed, NOT just a summary line. Read the existing doc first to match the format and level of detail:

   **If the phase created new routes:**
   - `docs/01-project-context.md` — add row to **Routes** table with route, route group, and full description

   **If the phase created new API routes:**
   - `docs/01-project-context.md` — add rows to **API Routes** table with route, HTTP method, and description for each endpoint
   - `docs/03-api-data-flow.md` — add a full section with query key constants, hook signatures, and a component usage example with loading/error/success states

   **If the phase created new feature folders:**
   - `docs/02-architecture.md` — add to **Features** tree listing every file with a descriptive `#` comment per file

   **If the phase created new layout components:**
   - `docs/02-architecture.md` — add to **Layouts** tree with file name and descriptive `#` comment

   **If the phase created new shared components:**
   - `docs/02-architecture.md` — add to **Shared** tree with file name and descriptive `#` comment (alphabetically sorted)
   - `docs/07-shared-components.md` — add a **full section** with: heading, import path, description paragraph, complete Props table (every prop, type, default, description), and multiple usage examples covering common scenarios. Match the format of existing component docs (e.g., PageHeader, MetricCard, DataTableCard)

   **If the phase created new types:**
   - `docs/02-architecture.md` — add to Folder Structure under `types/` with file name and comment listing key interfaces

   **If the phase created new services or data files:**
   - `docs/02-architecture.md` — add to Folder Structure under `lib/services/` or `data/` with file name and descriptive comment

   **If the phase created new forms:**
   - `docs/05-forms.md` — add a section with the form schema, field configuration, and a usage example

3. Show the user:
   - Summary of what was completed
   - Build status
   - Next phase preview (if any)
   - Suggest: "Run `/execute-plan {plan-name}` to continue with Phase {next}"

## Architecture Rules (NEVER VIOLATE)

These rules are non-negotiable. If a phase task conflicts with these, follow the rules:

### File Placement
- `app/**/page.tsx` must be **thin** — only import from `components/features/{page-name}/` and render it. NO UI code, NO logic, NO hooks in page files.
- `app/**/layout.tsx` must be **thin** — only import from `components/layouts/{layout-name}/` and render it. NO UI code in layout files.
- `app/api/` routes must be **thin** — only call services from `lib/services/` and return responses. NO business logic.
- All page UI goes in `components/features/{page-name}/` — the content component and sub-components.
- All layout UI goes in `components/layouts/{layout-name}/`.
- All reusable components go in `components/shared/`.
- `components/ui/` is for shadcn/ui ONLY — never put custom components there.

### Data Flow
- Component → `lib/api/` hook → `app/api/` route → `lib/services/{resource}/` → backend
- Never call backend directly from components
- Never put fetch logic in `app/api/` routes — they only call services
- All types go in `types/` folder — never inline interfaces shared across files

### Code Conventions
- File names: **kebab-case** always
- All `*-content.tsx` files must have `"use client"` directive
- Max **500 lines** per file — split if exceeded
- Use `@/` import alias
- No `any` types — strict TypeScript
- Use shadcn/ui primitives — not raw HTML for structural elements
- `DropdownMenuLabel` must be inside `DropdownMenuGroup`
- Card uses `shadow-sm` (not ring border)
- Button rendering non-button elements must use `nativeButton={false}`

## Execution Rules

- **One phase at a time** — never execute multiple phases in one go
- **Follow the dependency order** — if a phase depends on a prior phase, that phase must be ✅ Done
- **Build must pass** after each phase — this is non-negotiable
- **Don't skip tasks** — if a task seems unnecessary, flag it to the user instead of skipping
- **Update docs** — keep ALL project documentation in sync after each phase
- If a task is blocked or needs clarification, stop and ask the user before proceeding
- If the build fails after execution, fix the issues before marking the phase as done
