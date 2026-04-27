# CERBREC-UI: Create Page — Scaffold app route + feature content

Create a new page with all required files following the project conventions.

## Step 0: Read Project Docs (MANDATORY)

**Before writing ANY code**, read these docs:

1. `docs/01-project-context.md` — current routes to avoid conflicts
2. `docs/02-architecture.md` — folder structure, page/feature/layout component rules
3. `docs/04-conventions.md` — naming, shadcn notes, TypeScript patterns

## Step 1: Input

Ask the user for:
1. **Page name** — e.g., "users", "settings", "analytics" (kebab-case)
2. **Route group** — which layout? `(dashboard)/` (sidebar layout) or `auth/` (centered layout) or none (root)
3. **Page title** — displayed in breadcrumbs and PageHeader
4. **Description** — optional subtitle for PageHeader

## Step 2: Create Files

For a page named `{name}` in route group `{group}`:

### 1. Page file — `app/{group}/{name}/page.tsx`

**MUST be thin** — only imports the content component, nothing else:

```tsx
import { {PascalName}Content } from "@/components/features/{name}/{name}-content"

export default function {PascalName}Page() {
  return <{PascalName}Content />
}
```

NEVER put UI code, hooks, state, or logic in page files.

### 2. Content component — `components/features/{name}/{name}-content.tsx`

**MUST have `"use client"` directive.** All page UI lives here:

```tsx
"use client"

import { DashboardHeader } from "@/components/layouts/dashboard/dashboard-header"

export function {PascalName}Content() {
  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: "{Page Title}", href: "/{name}" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Page content here */}
      </div>
    </>
  )
}
```

For `auth/` group, do NOT include DashboardHeader — use a simple centered layout instead.

### 3. Sub-components (if needed) — `components/features/{name}/{name}-*.tsx`

If the page has sections (stats, charts, tables, etc.), create sub-components in the same feature folder:
- `components/features/{name}/{name}-stats.tsx`
- `components/features/{name}/{name}-table.tsx`

NEVER put sub-components in `app/` or in `components/shared/` (unless truly reusable across pages).

## Rules

- File names: **kebab-case** always
- Page file must be **thin** — only import + render content component
- Content file must have `"use client"` directive
- Use `@/` import alias for all imports
- If the page is under `(dashboard)/`, include `DashboardHeader` with breadcrumbs
- If page needs sub-routes later, create `app/{group}/{name}/layout.tsx` (thin — only imports from `components/layouts/`)
- Use existing shared components from `components/shared/` — don't recreate them
- Use shadcn/ui primitives from `components/ui/` — don't create custom UI components there

## Step 3: Verify & Update Docs

1. Run `pnpm build 2>&1 | tail -20` to verify build passes

2. Update `docs/01-project-context.md` — add a new row to the **Routes** table:
   ```
   | /{name}        | `(dashboard)/` | {Page title} — {description} |
   ```

3. Update `docs/02-architecture.md` — add the new feature folder to the **Features** section tree with every file listed and a comment describing each:
   ```
   ├── {name}/
   │   ├── {name}-content.tsx              # "use client" — {page title} page content
   │   ├── {name}-stats.tsx                # Stats section with metric cards
   │   └── {name}-table.tsx                # Data table with search and filters
   ```
   Make sure the tree stays alphabetically sorted and every file has a descriptive `#` comment.

4. Tell the user the page is ready and what URL to visit
