# CERBREC-UI: Create API — Scaffold types + service + route + hook

Scaffold a new API resource with the full data flow: types → service → API route → TanStack Query hook.

## Step 0: Read Project Docs (MANDATORY)

**Before writing ANY code**, read these docs:

1. `docs/02-architecture.md` — folder structure, where each file type belongs
2. `docs/03-api-data-flow.md` — API flow pattern, service pattern, hook pattern, query keys
3. `docs/04-conventions.md` — naming, TypeScript rules
4. `CLAUDE.md` — key rules quick reference

## Step 1: Input

Ask the user for:
1. **Resource name** — e.g., "users", "projects", "tickets" (kebab-case, plural)
2. **Fields** — list of fields with types for the main interface (e.g., `id: string`, `name: string`, `status: "active" | "inactive"`)
3. **Operations** — which CRUD operations? (list, get, create, update, delete)

## Step 2: Create Files

For a resource named `{name}` (plural) with singular `{singular}`:

### 1. Types — `types/{name}.ts`

Define all interfaces and types:

```ts
export interface {Singular} {
  id: string
  // ... fields from user input
}

// Only if "create" operation:
export interface Create{Singular}Payload {
  // ... fields without id
}

// Only if "update" operation:
export interface Update{Singular}Payload {
  // ... partial fields without id
}
```

Use `interface` for object shapes, `type` for unions/intersections.

### 2. Service — `lib/services/{name}/index.ts`

All backend API call logic lives here — NOT in API routes:

```ts
import { serviceGet, servicePost, servicePut, serviceDelete } from "@/lib/services"
import type { {Singular}, Create{Singular}Payload, Update{Singular}Payload } from "@/types/{name}"

// Only include functions for the requested operations:

export async function get{Plural}(): Promise<{Singular}[]> {
  return serviceGet<{Singular}[]>("/{name}")
}

export async function get{Singular}(id: string): Promise<{Singular}> {
  return serviceGet<{Singular}>(`/{name}/${id}`)
}

export async function create{Singular}(payload: Create{Singular}Payload): Promise<{Singular}> {
  return servicePost<{Singular}>("/{name}", payload)
}

export async function update{Singular}(id: string, payload: Update{Singular}Payload): Promise<{Singular}> {
  return servicePut<{Singular}>(`/{name}/${id}`, payload)
}

export async function delete{Singular}(id: string): Promise<void> {
  return serviceDelete(`/{name}/${id}`)
}
```

### 3. API Routes — `app/api/{name}/route.ts` (and `app/api/{name}/[id]/route.ts` if needed)

**MUST be thin** — no business logic, only call services:

```ts
// app/api/{name}/route.ts
import { get{Plural}, create{Singular} } from "@/lib/services/{name}"

export async function GET() {
  try {
    const data = await get{Plural}()
    return Response.json(data)
  } catch {
    return Response.json({ error: "Failed to fetch {name}" }, { status: 500 })
  }
}

// Only if "create" operation:
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await create{Singular}(body)
    return Response.json(data, { status: 201 })
  } catch {
    return Response.json({ error: "Failed to create {singular}" }, { status: 500 })
  }
}
```

```ts
// app/api/{name}/[id]/route.ts — only if get/update/delete by ID
import { get{Singular}, update{Singular}, delete{Singular} } from "@/lib/services/{name}"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await get{Singular}(id)
    return Response.json(data)
  } catch {
    return Response.json({ error: "{Singular} not found" }, { status: 404 })
  }
}

// PUT and DELETE follow the same pattern
```

### 4. TanStack Query Hooks — `lib/api/{name}.ts`

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchApi } from "@/lib/fetch"
import type { {Singular}, Create{Singular}Payload, Update{Singular}Payload } from "@/types/{name}"

export const {name}Keys = {
  all: ["{name}"] as const,
  detail: (id: string) => ["{name}", id] as const,
}

export function useGet{Plural}() {
  return useQuery({
    queryKey: {name}Keys.all,
    queryFn: () => fetchApi<{Singular}[]>("/api/{name}"),
  })
}

export function useGet{Singular}(id: string) {
  return useQuery({
    queryKey: {name}Keys.detail(id),
    queryFn: () => fetchApi<{Singular}>(`/api/{name}/${id}`),
    enabled: !!id,
  })
}

export function useCreate{Singular}() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Create{Singular}Payload) =>
      fetchApi<{Singular}>("/api/{name}", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: {name}Keys.all })
    },
  })
}

// useUpdate{Singular} and useDelete{Singular} follow the same pattern
```

## Architecture Rules

- Types in `types/` — never inline shared interfaces
- Services in `lib/services/{name}/` — all backend logic here
- API routes in `app/api/` — thin handlers only, no logic
- Hooks in `api/` — TanStack Query wrappers calling API routes
- Never expose `BACKEND_API_URL` to client
- No `any` types — strict TypeScript

## Step 3: Review

After creating all files, review the code quality:

1. **Architecture compliance** — verify each file is in the correct location per `docs/02-architecture.md`
2. **Types** — no `any`, all interfaces in `types/`, correct use of `interface` vs `type`
3. **Services** — all backend logic in service, not in API routes
4. **API routes** — thin handlers only, proper error handling
5. **Hooks** — query keys use constants, mutations invalidate relevant queries
6. **Naming** — kebab-case files, PascalCase components, camelCase functions
7. **Imports** — all use `@/` alias

## Step 4: Verify & Update Docs

1. Run `pnpm build 2>&1 | tail -20` to verify build passes

2. Update `docs/01-project-context.md` — add new rows to the **API Routes** table with method, route, and description:
   ```
   | `/api/{name}`       | GET    | List all {name}             |
   | `/api/{name}`       | POST   | Create a new {singular}     |
   | `/api/{name}/[id]`  | GET    | Get {singular} by ID        |
   | `/api/{name}/[id]`  | PUT    | Update {singular} by ID     |
   | `/api/{name}/[id]`  | DELETE | Delete {singular} by ID     |
   ```

3. Update `docs/02-architecture.md` — add to **Folder Structure** tree:
   - Under `api/`: add `{name}.ts` with comment listing all hooks (e.g., `# {Resource} hooks (useGet{Plural}, useCreate{Singular}, ...)`)
   - Under `app/api/`: add `{name}/` directory with route files and comments
   - Under `lib/services/`: add `{name}/` with `index.ts` and comment listing all service functions
   - Under `types/`: add `{name}.ts` with comment listing all interfaces

4. Update `docs/03-api-data-flow.md` — add a new section for the resource under a `## {Resource}` heading with:
   - Query key constants and their structure
   - List of available hooks with their signatures and what they return
   - Usage example showing a component consuming the hook with loading/error/success states:
   ```tsx
   const { data, isLoading, isError } = useGet{Plural}()
   if (isLoading) return <Skeleton />
   if (isError) return <ErrorState />
   return <div>{/* render data */}</div>
   ```

5. Tell the user what hooks are available and show a quick usage example
