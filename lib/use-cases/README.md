# Use Cases

Business logic layer. A use case orchestrates one or more repositories (and optionally Firebase Storage) to fulfill a specific business action.

## Pattern

```
lib/use-cases/{resource}/
├── index.ts          # Barrel export
├── create-{x}.ts     # One file per use case
├── update-{x}.ts
└── list-{x}.ts
```

## Rules

- **One file per use case** — keep functions focused on a single business action.
- Use cases NEVER touch Firestore directly — always go through `lib/repositories/`.
- Use cases handle file uploads via `lib/firebase/storage.ts`.
- Use cases validate input with Zod (defined alongside or imported from `types/`).
- Throw typed errors that API routes can map to HTTP status codes.

## Example

```ts
// lib/use-cases/sales/create-sale.ts
import "server-only"

import { salesRepository } from "@/lib/repositories/sales"
import { uploadFile } from "@/lib/firebase"
import type { CreateSalePayload, Sale } from "@/types/sales"

export async function createSale(payload: CreateSalePayload, receipt?: Buffer): Promise<Sale> {
  let receiptUrl: string | undefined
  if (receipt) {
    const result = await uploadFile({
      folder: "sales-receipts",
      contentType: "image/jpeg",
      buffer: receipt,
    })
    receiptUrl = result.url
  }

  return salesRepository.create({ ...payload, receiptUrl })
}
```

## Flow

```
Component
  → lib/api/{resource}.ts (TanStack Query hook)
    → app/api/{resource}/route.ts (thin Next.js handler)
      → lib/use-cases/{resource}/{action}.ts (business logic)
        → lib/repositories/{resource}/index.ts (Firestore access)
          → Firestore / Firebase Storage
```
