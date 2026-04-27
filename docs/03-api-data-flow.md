# API & Data Flow

## Flow Overview

```
[Component w/ Skeleton]        shows skeleton while loading
        ↓
[TanStack Query hook]          useQuery / useMutation in `lib/api/{resource}.ts`
        ↓
[Next.js API Route]            `app/api/{resource}/route.ts` — thin HTTP handler
        ↓
[Use Case]                     `lib/use-cases/{resource}/{action}.ts` — business logic
        ↓
[Repository]                   `lib/repositories/{resource}/index.ts` — Firestore CRUD
        ↓
[Firestore / Storage]          via Firebase Admin SDK (`lib/firebase/`)
        ↓
[Response]                     success or error returned to component
        ↓
[Component]                    handles isLoading (skeleton), isError, data
```

> **Architectural note:** Tidak ada backend HTTP eksternal. Project pakai pola **Repository + Use Case** di atas Firebase Admin SDK. Semua kode yang bicara dengan Firestore/Storage **harus** server-only (import `"server-only"` di top of file, atau hanya di-import dari API routes / use cases / repositories).

## Firebase Admin (`lib/firebase/`)

Singleton initialization untuk Firebase Admin SDK. Lazy init — credentials hanya dibutuhkan saat runtime (bukan saat build).

```ts
import { getDb, getDefaultBucket, uploadFile } from "@/lib/firebase"

// Firestore
const snapshot = await getDb().collection("sales").get()

// Storage upload
const result = await uploadFile({
  folder: "receipts",
  contentType: "image/jpeg",
  buffer: receiptBuffer,
})
```

## Repositories (`lib/repositories/{resource}/`)

Data access layer — pure Firestore CRUD, NO business logic. Extend `BaseRepository<T>` untuk dapat method standar (create, findById, findAll, update, delete, count).

```ts
// lib/repositories/sales/index.ts
import "server-only"

import { BaseRepository } from "@/lib/repositories"
import type { Sale } from "@/types/sales"

class SalesRepository extends BaseRepository<Sale> {
  constructor() {
    super("sales")
  }

  async findByDateRange(startTs: number, endTs: number): Promise<Sale[]> {
    return this.findAll({
      filters: [
        { field: "soldAt", op: ">=", value: startTs },
        { field: "soldAt", op: "<=", value: endTs },
      ],
      orderBy: { field: "soldAt", direction: "desc" },
    })
  }
}

export const salesRepository = new SalesRepository()
```

`BaseEntity` interface mewajibkan setiap doc punya `id`, `createdAt`, `updatedAt` (Unix timestamps in seconds — match konvensi project).

## Use Cases (`lib/use-cases/{resource}/`)

Business logic layer. **Satu file per use case** (action). Use case orchestrate repository + storage + validasi.

```ts
// lib/use-cases/sales/create-sale.ts
import "server-only"

import { salesRepository } from "@/lib/repositories/sales"
import { uploadFile } from "@/lib/firebase"
import type { CreateSalePayload, Sale } from "@/types/sales"

export async function createSale(
  payload: CreateSalePayload,
  receipt?: { buffer: Buffer; contentType: string }
): Promise<Sale> {
  let receiptUrl: string | undefined
  if (receipt) {
    const result = await uploadFile({
      folder: `sales-receipts/${new Date().getFullYear()}`,
      contentType: receipt.contentType,
      buffer: receipt.buffer,
    })
    receiptUrl = result.url
  }

  return salesRepository.create({ ...payload, receiptUrl })
}
```

**Rules:**
- Use cases JANGAN pernah import langsung dari `lib/firebase/admin.ts` untuk Firestore — selalu lewat repository.
- Use cases BOLEH import `uploadFile`/`deleteFile` untuk Storage operations.
- Validasi input pakai Zod (definisi di `types/{resource}.ts`).

## Next.js API Routes (`app/api/`)

- Thin HTTP handlers only — no business logic
- Call **use cases** and return the response (never call repositories directly from routes)
- Use httpOnly cookies for auth tokens

```ts
// app/api/sales/route.ts
import { createSale } from "@/lib/use-cases/sales/create-sale"
import { listSales } from "@/lib/use-cases/sales/list-sales"

export async function GET() {
  try {
    const data = await listSales()
    return Response.json(data)
  } catch {
    return Response.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const data = await createSale(payload)
    return Response.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create sale"
    return Response.json({ error: message }, { status: 400 })
  }
}
```

## API Hooks (`lib/api/`)

- One file per resource/domain (e.g., `lib/api/users.ts`, `lib/api/auth.ts`)
- Exports TanStack Query hooks (`useGetUsers`, `useCreateUser`, etc.)
- Hooks call Next.js API routes, NOT the backend directly
- Use `fetchApi` from `lib/fetch` for typed error handling
- Define query key constants for cache management

```ts
// lib/api/auth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchApi } from "@/lib/fetch"
import type { User, LoginPayload, LoginResponse } from "@/types/auth"

export const authKeys = {
  me: ["auth", "me"] as const,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => fetchApi<User>("/api/auth/me"),
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      fetchApi<LoginResponse>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, data.user)
    },
  })
}
```

## Worked Example: `accounts` resource (canonical pattern)

This example shows the complete vertical slice for a CRUD resource. Phases 03–06 mirror this structure 1:1.

### 1. Types + Zod schemas (`types/accounts.ts`)

```ts
import * as z from "zod"
import type { BaseEntity } from "@/lib/repositories"

export type AccountType = "bank" | "cash"

export interface Account extends BaseEntity {
  name: string
  type: AccountType
  code?: string
  balance: number
}

export const accountCreateSchema = z.object({
  name: z.string().min(2, "Nama rekening minimal 2 karakter."),
  type: z.enum(["bank", "cash"], { message: "Tipe rekening tidak valid." }),
  code: z.string().max(10, "Kode rekening maksimal 10 karakter."),
  balance: z.number().int().nonnegative("Saldo tidak boleh negatif."),
})

export type CreateAccountPayload = z.infer<typeof accountCreateSchema>
```

### 2. Repository (`lib/repositories/accounts/index.ts`)

```ts
import "server-only"
import { BaseRepository } from "@/lib/repositories"
import type { Account } from "@/types/accounts"

class AccountsRepository extends BaseRepository<Account> {
  constructor() { super("accounts") }

  async findByCode(code: string): Promise<Account | null> {
    const results = await this.findAll({
      filters: [{ field: "code", op: "==", value: code }],
      limit: 1,
    })
    return results[0] ?? null
  }
}

export const accountsRepository = new AccountsRepository()
```

### 3. Use cases (`lib/use-cases/accounts/`)

One file per action. Each use case validates input via Zod and calls the repository:

```ts
// lib/use-cases/accounts/create-account.ts
import "server-only"
import { accountsRepository } from "@/lib/repositories/accounts"
import { accountCreateSchema, type Account, type CreateAccountPayload } from "@/types/accounts"

export async function createAccount(payload: CreateAccountPayload): Promise<Account> {
  const parsed = accountCreateSchema.parse(payload)
  return accountsRepository.create({
    name: parsed.name,
    type: parsed.type,
    code: parsed.code?.trim() ? parsed.code.trim() : undefined,
    balance: parsed.balance,
  })
}
```

A typed not-found error lives in `get-account.ts` and is re-used by `update-account.ts` and `delete-account.ts`:

```ts
// lib/use-cases/accounts/get-account.ts
export class AccountNotFoundError extends Error {
  constructor(id: string) {
    super(`Rekening dengan ID ${id} tidak ditemukan.`)
    this.name = "AccountNotFoundError"
  }
}
```

### 4. API routes (`app/api/accounts/`)

Thin handlers — they call use cases and map errors to HTTP status codes.

```ts
// app/api/accounts/route.ts
import { ZodError } from "zod"
import { createAccount, listAccounts } from "@/lib/use-cases/accounts"

export async function GET() {
  try {
    return Response.json(await listAccounts())
  } catch {
    return Response.json({ error: "Gagal memuat daftar rekening." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    return Response.json(await createAccount(body), { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 })
    }
    return Response.json({ error: "Gagal membuat rekening." }, { status: 500 })
  }
}
```

The `[id]/route.ts` handles GET/PATCH/DELETE and maps `AccountNotFoundError` → `404`.

### 5. TanStack Query hooks (`lib/api/accounts.ts`)

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchApi } from "@/lib/fetch"
import type { Account, CreateAccountPayload } from "@/types/accounts"

export const accountKeys = {
  all: ["accounts"] as const,
  list: () => [...accountKeys.all, "list"] as const,
  detail: (id: string) => [...accountKeys.all, "detail", id] as const,
}

export function useGetAccounts() {
  return useQuery({
    queryKey: accountKeys.list(),
    queryFn: () => fetchApi<Account[]>("/api/accounts"),
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) =>
      fetchApi<Account>("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.list() }),
  })
}
```

### 6. Component (`components/features/rekening/`)

Each feature folder contains 4 files following this naming:

| File | Purpose |
|---|---|
| `{slug}-content.tsx` | Orchestrator — `"use client"`, manages dialog state, wires data + mutations |
| `{slug}-table.tsx` | `DataTableCard` with columns + row actions (Ubah/Hapus dropdown) |
| `{slug}-form.tsx` | TanStack Form + Zod schema, used in Dialog for create/edit |
| `{slug}-skeleton.tsx` | Loading skeleton (Card + Skeleton bars) |

The page (`app/(dashboard)/rekening/page.tsx`) is thin — just imports `RekeningContent`.

The orchestrator handles loading/error/success states and shows toast notifications in Indonesian after mutations. Delete confirmation uses `<AlertDialog>` to prevent accidental deletion.

## Aggregation queries (`lib/use-cases/reports/`)

Reporting aggregations live in their **own use cases**, separate from per-resource use cases. They orchestrate multiple repositories and compute totals in memory.

### Pattern

```ts
// lib/use-cases/reports/get-period-summary.ts
import "server-only"

import { expensesRepository } from "@/lib/repositories/expenses"
import { purchasesRepository } from "@/lib/repositories/purchases"
import { salariesRepository } from "@/lib/repositories/salaries"
import { salesRepository } from "@/lib/repositories/sales"
import type { PeriodSummary } from "@/types/reports"

export async function getPeriodSummary({ from, to }: { from: number; to: number }): Promise<PeriodSummary> {
  const [sales, purchases, salaries, expenses] = await Promise.all([
    salesRepository.findByDateRange(from, to),
    purchasesRepository.findByDateRange(from, to),
    salariesRepository.findByDateRange(from, to),
    expensesRepository.findByDateRange(from, to),
  ])

  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0)
  // ... compute the rest
  return { totalRevenue, /* ... */ }
}
```

Aggregations DO NOT belong in per-resource use case folders (don't put `getSalesSummary` inside `lib/use-cases/sales/`). They cross resource boundaries and naturally collect under `reports/`.

### When to use

- **In-memory aggregation** (current MVP approach): fetch raw documents, compute in JavaScript. Fine for SMB scale (~10k transactions/year).
- **Denormalized counters / summary docs** (future, if needed): for tens of thousands+ of transactions per period, write Firestore triggers (Cloud Functions) to maintain pre-computed totals. Out of MVP scope.

### Mixed date storage gotcha

Most resources use **Unix seconds** for date fields (`soldAt`, `purchasedAt`, etc.). The `unsold_items` collection uses **`YYYY-MM-DD` strings** for its `date` field. Aggregation use cases that span both (like `getTopUnsoldProducts({ from, to })` taking Unix sec inputs) must convert Unix→ISO string before querying the unsold repo. See `lib/use-cases/reports/get-top-unsold-products.ts` for the converter pattern.

### Period preset helper

`getPeriodRange(preset)` from `@/components/shared/period-picker` returns `{ from: number; to: number }` in Unix seconds for presets `"today" | "this-week" | "this-month" | "last-month"`. Use on the client to build the range and pass to the report hooks.

## File uploads via Firebase Storage

File uploads (currently used for receipt photos in transaction forms) bypass the JSON-only `fetchApi` helper. The flow:

```
Component (FormData)
  → useUploadReceipt() mutation [POST /api/uploads as multipart/form-data]
    → app/api/uploads/route.ts [reads File via request.formData(), converts to Buffer]
      → uploadReceipt use case [validates type+size, throws InvalidReceiptError]
        → uploadFile from lib/firebase [Storage SDK, makePublic: true]
          → Firebase Storage (gs://{bucket}/sales-receipts/YYYY/MM/{uuid})
            → returns { path, url } back to component
              → component stores url+path on the transaction document
```

### Allowed folders

The API route whitelists folders to prevent arbitrary writes anywhere in the bucket:

```ts
const ALLOWED_FOLDERS = new Set([
  "sales-receipts",
  "purchases-receipts",
  "salaries-receipts",
  "expenses-receipts",
])
```

The route prefixes the request folder with `YYYY/MM/` automatically: `sales-receipts/2026/04/{uuid}`.

### File validation

Validated in the use case (`lib/use-cases/uploads/upload-receipt.ts`):

- Allowed content types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/heic`
- Max file size: 5 MB (`MAX_RECEIPT_SIZE_MB` constant)

Validation errors throw `InvalidReceiptError` which the API route maps to `400 Bad Request` with the Indonesian message.

### Public URLs

Receipt files are made public (`makePublic: true`) so the URL never expires. This is acceptable for receipts because they only contain transaction-internal information; URL guessability is mitigated by random UUID filenames. For sensitive uploads in the future, switch to signed URLs (already supported via `getReadSignedUrl`).

### Receipt deletion

When a sale is deleted, the use case best-effort deletes the storage file (`deleteFile` with `ignoreNotFound: true`). Failure does not block the database deletion — orphaned files can be cleaned up later if needed.

### Component usage

Use the shared `<ReceiptUpload>` component (`components/shared/receipt-upload.tsx`) — see `docs/07-shared-components.md` for full props.

```tsx
<ReceiptUpload
  value={form.values.receiptUrl}
  folder="sales-receipts"
  onChange={(url, path) => {
    form.setFieldValue("receiptUrl", url)
    form.setFieldValue("receiptPath", path)
  }}
/>
```

## Auth Context (`context/auth-provider.tsx`)

Wraps `useCurrentUser` query and provides auth state to the app:

```tsx
import { useAuth } from "@/context/auth-provider"

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()
}
```

- `AuthProvider` wraps the app in root layout
- `useAuth()` hook provides `user`, `isAuthenticated`, `isLoading`
- Used by sidebar (user menu), nav-user (logout), and any component needing auth state

## Component Pattern

Every component that fetches data MUST handle 3 states:

1. **Loading** — show a skeleton component
2. **Error** — show an error message
3. **Success** — render the data

```tsx
// components/features/dashboard/dashboard-stats.tsx
"use client"

import { useGetStats } from "@/lib/api/stats"
import { DashboardStatsSkeleton } from "./dashboard-stats-skeleton"

export function DashboardStats() {
  const { data, isLoading, isError } = useGetStats()

  if (isLoading) return <DashboardStatsSkeleton />
  if (isError) return <p>Failed to load stats.</p>

  return <div>{/* render data */}</div>
}
```

## Types (`types/`)

- **All** interfaces and types must be defined in `types/` folder — never inline
- Define request/response types per resource (e.g., `types/auth.ts`, `types/users.ts`)
- Shared between services, API hooks, and components
- Use `interface` for object shapes, `type` for unions/intersections
- No `any` types — always use strict TypeScript

```ts
// types/auth.ts
export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
}

export type UserRole = "admin" | "editor" | "viewer"

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}
```
