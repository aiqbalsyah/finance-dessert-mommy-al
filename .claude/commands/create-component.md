# CERBREC-UI: Create Component — Scaffold shared component with shadcn primitives

Scaffold a new reusable shared component in `components/shared/`.

## Step 0: Read Project Docs (MANDATORY)

**Before writing ANY code**, read these docs:

1. `docs/02-architecture.md` — folder structure, where shared components belong
2. `docs/04-conventions.md` — naming, shadcn notes, TypeScript rules
3. `docs/07-shared-components.md` — existing shared components (avoid duplicates, follow patterns)

## Step 1: Input

Ask the user for:
1. **Component name** — e.g., "status-card", "user-avatar", "progress-tracker" (kebab-case)
2. **Purpose** — what the component does (one sentence)
3. **Props** — key props it should accept

## Step 2: Create File

### `components/shared/{name}.tsx`

If the component has variants/sub-components, create a folder instead: `components/shared/{name}/`

Follow this pattern:

```tsx
"use client"

import { cn } from "@/lib/utils"
// Import shadcn/ui primitives as needed (Card, Badge, Separator, etc.)

interface {PascalName}Props {
  // ... props from user input
  className?: string  // Always include className
}

export function {PascalName}({ className, ...props }: {PascalName}Props) {
  return (
    <div className={cn("base-styles", className)}>
      {/* Use shadcn/ui primitives — not raw HTML */}
    </div>
  )
}
```

## Architecture Rules

- Shared components go in `components/shared/` — NEVER in `components/ui/` (shadcn only)
- List item variants go in `components/shared/list-item/`
- Must have `"use client"` directive
- Must use shadcn/ui primitives (Card, Separator, Badge, etc.) — not raw HTML for structural elements
- Always accept `className` prop for customization
- Keep props generic — avoid page-specific naming (e.g., use `leading` not `avatar`)
- Props: inline interface for simple components, or in `types/` if shared across files
- Max 500 lines per file — split if needed
- If the component has a loading state, include an `isLoading` prop with Skeleton
- Use Lucide React for icons (accept `LucideIcon` type for configurable icons)

## Component Guidelines

**Card-based components** — use shadcn Card:
```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

<Card className={cn("shadow-sm", className)}>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
    {description && <CardDescription>{description}</CardDescription>}
  </CardHeader>
  <CardContent>{/* content */}</CardContent>
</Card>
```

**List item components** — place in `components/shared/list-item/`:
- Accept `leading`, `title`, `subtitle`, `trailing` props
- Use `Separator` between items
- Support `hideSeparator` for last item

**Skeleton loading** — use shadcn Skeleton:
```tsx
import { Skeleton } from "@/components/ui/skeleton"

if (isLoading) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}
```

## Step 3: Review

After creating the component, review the code quality:

1. **Placement** — file is in `components/shared/`, not in `components/ui/` or feature folder
2. **shadcn primitives** — uses Card, Badge, Separator, etc. instead of raw divs for structural elements
3. **TypeScript** — no `any`, props interface is complete, correct use of `interface` vs `type`
4. **Naming** — kebab-case file, PascalCase component, props follow generic naming
5. **className** — accepts and applies className via `cn()`
6. **Loading state** — if applicable, includes Skeleton with same layout
7. **Imports** — all use `@/` alias, no unused imports

## Step 4: Verify & Update Docs

1. Run `pnpm build 2>&1 | tail -20` to verify build passes

2. Update `docs/07-shared-components.md` — add a **full new section** following the existing format. It MUST include:

   **a) Heading + import path + description:**
   ```markdown
   ## {ComponentName}

   **Import:** `@/components/shared/{file-name}`

   {One paragraph describing what the component does and when to use it.}
   ```

   **b) Full Props table with every prop, type, default, and description:**
   ```markdown
   ### Props

   | Prop        | Type        | Default | Description                    |
   | ----------- | ----------- | ------- | ------------------------------ |
   | `title`     | `string`    | —       | Card title text                |
   | `className` | `string`    | —       | Additional CSS classes         |
   | `isLoading` | `boolean`   | `false` | Show skeleton loading state    |
   ```

   **c) Multiple usage examples covering common scenarios:**
   ```markdown
   ### Usage

   ```tsx
   // Basic usage
   <{ComponentName} title="Example" />

   // With loading state
   <{ComponentName} title="Example" isLoading />

   // With custom className
   <{ComponentName} title="Example" className="col-span-2" />
   ```
   ```

   Look at existing component docs in `docs/07-shared-components.md` (e.g., PageHeader, MetricCard, DataTableCard) for the exact level of detail expected. Match that standard.

3. Update `docs/02-architecture.md` — add the component to the **Shared** section tree with a descriptive `#` comment:
   ```
   ├── {file-name}.tsx              # {Short description of the component}
   ```
   Keep the tree alphabetically sorted.

4. Tell the user the import path and show a quick usage example
