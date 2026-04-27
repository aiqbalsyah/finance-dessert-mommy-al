# CERBREC-UI: Plan — Create structured implementation plan with numbered phases

Create a structured implementation plan with numbered phases in `docs/planning/`.

## Step 0: Read Project Docs (MANDATORY)

**Before creating any plan**, you MUST read these docs to understand the architecture and ensure the plan respects it:

1. `docs/01-project-context.md` — current routes, API routes, environment
2. `docs/02-architecture.md` — folder structure, component placement rules, existing features
3. `docs/03-api-data-flow.md` — API flow pattern (types → service → route → hook → component)
4. `docs/04-conventions.md` — naming, shadcn notes, TypeScript, data fetching patterns
5. `docs/07-shared-components.md` — existing shared components to reuse
6. `CLAUDE.md` — key rules quick reference

Also scan relevant directories with `ls` to understand what already exists.

## Step 1: Gather Requirements

Ask the user for:
1. **Plan name** — short kebab-case name (e.g., "user-management", "analytics-dashboard", "auth-rbac")
2. **Goal** — what should be achieved when all phases are complete? (1-2 sentences)
3. **Scope** — key features or requirements (bullet points)

Wait for the user to respond before proceeding.

## Step 2: Research

Before writing the plan, understand the current codebase state:
- Read relevant docs and existing code related to the goal
- Identify what already exists that can be reused (shared components, existing services, etc.)
- Identify dependencies between features

## Step 3: Create Plan Directory

Create `docs/planning/{plan-name}/` with:

### `README.md` — Plan overview

```markdown
# {Plan Title}

**Goal:** {goal}
**Status:** In Progress
**Created:** {YYYY-MM-DD}

## Phases

| # | Phase | Status | Description |
|---|-------|--------|-------------|
| 01 | {phase-name} | ⬜ Pending | {short description} |
| 02 | {phase-name} | ⬜ Pending | {short description} |
| ... | ... | ... | ... |

Status legend: ⬜ Pending → 🔄 In Progress → ✅ Done → ⏭️ Skipped
```

### Phase files — `{NN}-{phase-name}.md`

Each phase file follows this structure:

```markdown
# Phase {NN}: {Phase Title}

**Status:** ⬜ Pending
**Depends on:** {list prior phases, or "None"}

## Goal

{What this phase achieves — 1-2 sentences}

## Tasks

- [ ] {Task 1 — specific, actionable}
- [ ] {Task 2}
- [ ] {Task 3}
- [ ] Update project docs (comprehensive, detailed — not summary lines)

## Files to Create/Modify

- `{file-path}` — {what to do}
- `{file-path}` — {what to do}

## Docs to Update

List which docs need updates and what to add:
- `docs/{xx}-{name}.md` — {what section to add/update and level of detail}

## Acceptance Criteria

- [ ] `pnpm build` passes
- [ ] {Criteria 1 — how to verify this phase is done}
- [ ] {Criteria 2}
- [ ] All relevant docs updated with comprehensive detail (props tables, usage examples, full tree entries)

## Notes

{Any technical decisions, edge cases, or context needed for execution}
```

## Planning Rules

### Structure Rules
- **3-8 phases** per plan — enough detail without over-planning
- **Each phase should be independently shippable** — the app should work after each phase
- **Order by dependency** — foundations first, features second, polish last
- **Each phase takes ~1 conversation** — not too big, not too small
- **Tasks must be specific** — "Create `types/users.ts` with User interface" not "Implement feature"
- **Files to Create/Modify** must list actual paths following the architecture
- **Acceptance Criteria** must be verifiable (build passes, page renders, API responds, etc.)
- **Every phase must include a "Update project docs" task** — doc updates are not optional
- **Docs to Update** section must specify exactly which docs to update and what detail to add

### Documentation Rules
Every phase that creates or modifies code MUST include doc updates as a task. The docs must be **comprehensive and detailed** — not just a summary line. Specifically:

- **New routes** → full row in `docs/01-project-context.md` Routes table
- **New API routes** → full rows in `docs/01-project-context.md` API Routes table + full section in `docs/03-api-data-flow.md` with hook signatures and usage examples
- **New feature folders** → full file tree in `docs/02-architecture.md` Features section with `#` comment per file
- **New shared components** → full section in `docs/07-shared-components.md` with import path, description, complete Props table, and multiple usage examples. Plus entry in `docs/02-architecture.md` Shared tree
- **New layout components** → entry in `docs/02-architecture.md` Layouts tree with descriptive comment
- **New types/services/data files** → entries in `docs/02-architecture.md` Folder Structure with descriptive comments

Read the existing docs first to match the established format and level of detail.

### Architecture Rules (MUST be followed in every phase)

Phase file paths and tasks MUST follow the project architecture. Never plan to:

- Put UI code directly in `app/**/page.tsx` — pages are thin, content goes in `components/features/{page-name}/`
- Put UI code directly in `app/**/layout.tsx` — layouts are thin, content goes in `components/layouts/{layout-name}/`
- Put business logic in `app/api/` routes — they only call services from `lib/services/`
- Put custom components in `components/ui/` — that's shadcn only
- Inline types in component files — types go in `types/` folder
- Call backend directly from components — use the full API flow

Correct file placement pattern for a new feature:
```
types/{resource}.ts                           ← Types/interfaces
lib/services/{resource}/index.ts              ← Backend API calls
app/api/{resource}/route.ts                   ← Thin API route
lib/api/{resource}.ts                         ← TanStack Query hooks
app/(dashboard)/{page-name}/page.tsx          ← Thin page (import + render only)
components/features/{page-name}/{name}-content.tsx  ← "use client" content
components/features/{page-name}/{name}-*.tsx   ← Sub-components
components/shared/{name}.tsx                   ← Reusable shared components
```

### Common Phase Ordering
1. Types + data models (`types/`)
2. Services + API routes (`lib/services/` + `app/api/`)
3. TanStack Query hooks (`api/`)
4. Shared components if needed (`components/shared/`)
5. Page + feature components (`app/` + `components/features/`)
6. Polish + edge cases

## Step 4: Summary

After creating all files, show:
- Plan name and directory path
- Phase count and overview table
- Suggest running `/execute-plan {plan-name}` to start phase 01
