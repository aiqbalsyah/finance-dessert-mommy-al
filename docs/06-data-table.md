# Data Table — TanStack Table + shadcn/ui

## Overview

Data tables are built using `@tanstack/react-table` (headless) + shadcn `Table` component for UI.

## Shared DataTableCard

For quick data table usage, use `components/shared/data-table-card.tsx`:

```tsx
import { DataTableCard } from "@/components/shared/data-table-card"

<DataTableCard
  title="Orders"
  description="All orders"
  columns={columns}
  data={data}
  searchKey="customer"
  searchPlaceholder="Search customers..."
  filters={[
    {
      columnKey: "status",
      label: "Status",
      options: [
        { label: "Completed", value: "Completed" },
        { label: "Pending", value: "Pending" },
      ],
    },
  ]}
  sortOptions={[
    { columnKey: "customer", label: "Customer" },
    { columnKey: "amount", label: "Amount" },
  ]}
  pageSize={10}
/>
```

### DataTableCard Props

| Prop              | Type                  | Default        | Description                          |
| ----------------- | --------------------- | -------------- | ------------------------------------ |
| `title`           | `string`              | —              | Card title                           |
| `description`     | `string`              | —              | Card description                     |
| `action`          | `ReactNode`           | —              | Card header action (e.g., button)    |
| `columns`         | `ColumnDef[]`         | —              | TanStack Table column definitions    |
| `data`            | `TData[]`             | —              | Table data                           |
| `searchKey`       | `string`              | —              | Column key for search (omit for global) |
| `searchPlaceholder` | `string`            | `"Search..."`  | Search input placeholder             |
| `filters`         | `DataTableFilter[]`   | —              | Dropdown filter configs              |
| `sortOptions`     | `DataTableSortOption[]` | —            | Sort dropdown options                |
| `maxHeight`       | `string`              | `"500px"`      | Scroll area max/min height           |
| `minWidth`        | `string`              | —              | Table min-width for horizontal scroll |
| `className`       | `string`              | —              | Additional CSS classes on Card       |
| `pageSize`        | `number`              | `10`           | Rows per page                        |
| `showPagination`  | `boolean`             | `true`         | Show pagination footer               |
| `showSearch`      | `boolean`             | `true`         | Show search input                    |
| `showColumnFilter`| `boolean`             | `true`         | Show column visibility toggle        |
| `showSelectedCount` | `boolean`           | `false`        | Show selected row count              |
| `emptyMessage`    | `string`              | `"No results."`| Message when no data                 |

### Features
- **Search**: Global or column-specific filtering
- **Filters**: DropdownMenu-based filter buttons (consistent style)
- **Sort**: Toolbar dropdown + clickable thead with arrow icons
- **Pagination**: First/prev/next/last buttons with "Page X of Y"
- **Column visibility**: Toggle columns via dropdown
- **Sticky header**: Header stays fixed while scrolling (opaque `bg-muted`)
- **Scroll**: Native `overflow-auto` for both horizontal and vertical scroll

### Two Usage Modes

**Paginated** (default) — rows split across pages:
```tsx
<DataTableCard
  title="Orders"
  columns={columns}
  data={data}
  pageSize={10}
  showPagination={true}
/>
```

**Scrollable** — all rows visible with vertical scroll, no pagination:
```tsx
<DataTableCard
  title="Orders"
  columns={columns}
  data={data}
  showPagination={false}
  maxHeight="500px"
  minWidth="1200px"
/>
```

## Custom Data Tables

For complex page-specific tables, create files inside the feature folder:

```
components/features/{page-name}/
├── {name}-columns.tsx        # Column definitions
├── {name}-data-table.tsx     # DataTable component
└── {name}-page.tsx           # Page component that wires it together
```

## Column Definitions

### Basic Columns

Define the type in `types/` folder, then import it:

```ts
// types/payments.ts
export interface Payment {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}
```

```tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import type { Payment } from "@/types/payments"

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
]
```

### Cell Formatting

```tsx
{
  accessorKey: "amount",
  header: () => <div className="text-right">Amount</div>,
  cell: ({ row }) => {
    const amount = parseFloat(row.getValue("amount"))
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
    return <div className="text-right font-medium">{formatted}</div>
  },
}
```

### Sortable Column Header

```tsx
import { Icon } from "@/components/shared/icon"
import { Button } from "@/components/ui/button"

{
  accessorKey: "email",
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Email
      <Icon name="swap_vert" size={16} className="ml-2" />
    </Button>
  ),
}
```

### Row Selection Column

```tsx
import { Checkbox } from "@/components/ui/checkbox"

{
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
  enableHiding: false,
}
```

### Row Actions Column

```tsx
import { Icon } from "@/components/shared/icon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

{
  id: "actions",
  cell: ({ row }) => {
    const payment = row.original
    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
          <span className="sr-only">Open menu</span>
          <Icon name="more_horiz" size={16} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}
```

## Table Styling

- `<table>`: `border-collapse` to prevent default `border-spacing` gap under sticky header
- `TableHead`: `border-t bg-muted` (opaque, not `bg-muted/50`) for sticky header, `first:pl-4 last:pr-4` for card-aligned padding
- `TableCell`: `first:pl-4 last:pr-4` matching header padding, `whitespace-nowrap` by default
- Card uses `shadow-sm` (not ring border)
- Sticky header with `sticky top-0 z-10`

## Scroll Architecture

Table scroll is handled with native CSS overflow, not shadcn ScrollArea:

```
CardContent (overflow-hidden px-0 pt-0 pb-0)
  └─ div (overflow-auto, minHeight + maxHeight)
       └─ div (minWidth wrapper — for horizontal scroll)
            └─ Table
                 └─ TableHeader (sticky top-0 z-10)
                 └─ TableBody
```

Key points:
- `overflow-hidden` on `CardContent` prevents table from leaking scroll to parent
- `overflow-x-hidden` on `SidebarInset` (in `sidebar.tsx`) prevents body scroll-x
- `minWidth` is applied on a wrapper div around `<Table>`, not on Table itself
- `minHeight: maxHeight, maxHeight` gives consistent scroll area height
- Do NOT use `ScrollArea` — it breaks sticky headers and horizontal scroll simultaneously

## Important Notes

- shadcn/ui uses `render` prop (not `asChild`) for component composition
- `DropdownMenuLabel` must be wrapped in `DropdownMenuGroup` (base-ui requirement)
- All toolbar buttons use DropdownMenu style for consistency (not Select)
