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

## Audit trail (`createdBy` / `updatedBy`)

`BaseEntity` includes optional `createdBy` and `updatedBy` fields of type `Actor` (`{ userId, userName }`). Every create/update use case takes an `actor` argument and writes the snapshot to the doc. Reads are not audited.

### Why optional?

Pre-audit-trail rows have no `createdBy`. Making the fields optional means historical data renders without backfill. UI components handle `undefined` gracefully — `<AuditTooltip>` suppresses the tooltip when both fields are absent.

### Why pass `actor` explicitly?

Use cases stay pure — no implicit dependency on request context, easier to unit-test (just pass a mock actor). The API route is the boundary that knows about HTTP/auth.

### Pattern — use case

```ts
import type { Actor } from "@/lib/repositories"

export async function createSale(payload: CreateSalePayload, actor: Actor): Promise<Sale> {
  const parsed = saleCreateSchema.parse(payload)
  // ...
  return salesRepository.create({
    // ...domain fields
    createdBy: actor,
    updatedBy: actor,
  })
}

export async function updateSale(id: string, payload: UpdateSalePayload, actor: Actor): Promise<Sale> {
  // ...
  const updates: Partial<Sale> = { updatedBy: actor }
  // ...rest of merge
  return salesRepository.update(id, updates)
}
```

### Pattern — API route

The current user comes from the `withAuth` callback's third argument:

```ts
export const POST = withAuth(async (request, _ctx, user) => {
  const body = await request.json()
  const data = await createSale(body, { userId: user.id, userName: user.displayName })
  return Response.json(data, { status: 201 })
}, { permission: "sales:create" })
```

### Snapshot vs FK

`Actor` stores `{ userId, userName }` denormalized — preserves the name even after the user is renamed or deleted. Trade-off: rename doesn't propagate to old records (acceptable; the audit IS the historical fact).

### Surfacing in UI

Use `<AuditTooltip>` from `@/components/shared/audit-tooltip` to wrap cell content (typically the Tanggal column). Tooltip shows "Dibuat oleh X • 2 jam yang lalu" plus "Diubah oleh Y • 30 menit yang lalu" if the row was edited after creation.

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

## Authentication flow

The app uses Firebase Authentication (email + password). The session is anchored by an httpOnly cookie carrying a Firebase ID token, verified server-side on every request.

```
[Client]                                                     [Server]                                [Firebase]
LoginForm.handleSubmit
  ↓
useLogin mutation
  ↓
signInWithEmailAndPassword (Firebase Web SDK) ─────────────────────────────────────────────────►  authenticate
  ↓
user.getIdToken()
  ↓
POST /api/auth/login { idToken } ─────────────►  verifyIdToken (Admin SDK) ────────────────────►  validate
                                                  ↓
                                                  usersRepository.findById(uid) (Firestore users/{uid})
                                                  ↓
                                                  set 'auth-token' httpOnly cookie + return { user }
  ↓
queryClient.setQueryData(authKeys.me, user)
redirect to /dashboard

[Subsequent navigations]
GET /api/auth/me ──────────────────────────────►  read cookie → verifyIdToken → findById → return profile
```

The cookie is sent automatically with every request to the same domain. Server-side handlers verify it via `verifyIdToken` from `@/lib/services/auth` (which calls Firebase Admin SDK against Google's public keys). The cookie is the transport, but the source of truth is the verified token + the Firestore user profile.

### Why ID token instead of session cookie?

Firebase Auth supports two patterns: short-lived ID tokens (1 hour) auto-refreshed by the Web SDK, OR long-lived session cookies via `createSessionCookie`. We use the **ID token** approach for MVP simplicity:
- Token in cookie → verified on each request
- Web SDK auto-refreshes the in-memory token
- 7-day cookie max-age is OK for SMB use; `verifyIdToken` will reject expired tokens regardless of cookie age

For high-traffic apps, consider switching to session cookies (longer expiry, fewer round trips).

### Indonesian error messages

`lib/api/auth.ts` maps Firebase error codes to Indonesian messages:

| Firebase code | Pesan |
|---|---|
| `auth/invalid-credential`, `auth/user-not-found`, `auth/wrong-password` | "Email atau kata sandi salah." |
| `auth/invalid-email` | "Format email tidak valid." |
| `auth/user-disabled` | "Akun Anda telah dinonaktifkan. Hubungi administrator." |
| `auth/too-many-requests` | "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi." |
| `auth/network-request-failed` | "Tidak dapat terhubung ke server. Periksa koneksi internet Anda." |

Server-side errors (from `/api/auth/login`) return Indonesian messages directly in the JSON body.

## RBAC: protecting API routes

All API routes (except `/api/auth/login` and `/api/auth/logout`) MUST be wrapped with `withAuth()` from `@/lib/auth`. The wrapper handles 401 (no session) and 403 (wrong role) before the handler runs, so the handler can trust that the resolved `user` is valid and authorized.

### Pattern

```ts
import { withAuth } from "@/lib/auth"
import { listAccounts } from "@/lib/use-cases/accounts"

export const GET = withAuth(async (request, ctx, user) => {
  const data = await listAccounts()
  return Response.json(data)
}, { permission: "accounts:read" })
```

The handler signature is `(request, context, user)` where `user` is the resolved Firestore profile (`User` type, includes `role`).

### Options

- `{ permission: "accounts:read" }` — require this specific permission. 403 if user's role doesn't have it.
- `{ allowAny: true }` — only require a valid logged-in user; no role check. Used for `/api/auth/me`.
- `{}` (no options) — same as `allowAny: true`. Prefer being explicit.

### Permissions

Permission strings follow `<resource>:<action>` (e.g., `"accounts:create"`, `"sales:delete"`). Special keys: `"users:manage"` (Admin-only user CRUD), `"uploads:write"` (file uploads). The full matrix lives in `lib/auth/permissions.ts` and mirrors the table in `docs/planning/auth-and-rbac/README.md`.

### Helpers (server-only)

```ts
import { getCurrentUser, requireUser, can, requirePermission } from "@/lib/auth"

// In a server component or server action:
const user = await getCurrentUser()       // null if not logged in
const user2 = await requireUser()         // throws UnauthorizedError if null
const allowed = can(user.role, "sales:create")  // boolean
requirePermission(user.role, "accounts:delete") // throws ForbiddenError if denied
```

`getCurrentUser()` is wrapped in `React.cache`, so multiple callers in the same request share one Firestore lookup + token verification.

### Error mapping

`UnauthorizedError` → 401 (handled inside `withAuth`)
`ForbiddenError` → 403 (handled inside `withAuth`)

If your use case throws `ForbiddenError` for business-logic reasons (e.g., last-admin guard already throws `LastAdminError` instead), map them in the route catch block as needed. The convention: 401 means "log in again", 403 means "you can't do this even after re-login".

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
