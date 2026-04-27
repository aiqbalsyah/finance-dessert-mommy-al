# Shared Components

Reusable components that live in `components/shared/` and `components/layouts/dashboard/page-header.tsx`. These are building blocks used across multiple pages.

Preview all components at `/components` (components showcase page).

> **Note:** Shared components are being rebuilt from the Figma design system. New components will be added as they are implemented.

## Creating a New Shared Component

### Rules
- Place in `components/shared/` (or `components/shared/{category}/` for variants)
- Must have `"use client"` directive
- Must use shadcn/ui primitives (Card, Separator, Accordion, etc.) — not raw HTML
- Keep props generic — avoid page-specific naming (e.g., use `leading` not `avatar`)
- Accept `className` prop for customization
- Types can be inline for simple props, or in `types/` if shared across files
- Max 500 lines per file
- Colors must match Figma design exactly — use hex values from Figma specs

### Pattern

```tsx
"use client"

import { cn } from "@/lib/utils"
// Import shadcn/ui primitives as needed

interface MyComponentProps {
  title: string
  // ... other props
  className?: string
}

export function MyComponent({ title, className }: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      {/* Use shadcn/ui primitives */}
    </div>
  )
}
```

---

## ReceiptUpload

**Import:** `@/components/shared/receipt-upload`

Image upload dropzone for receipt photos. Posts the file to `/api/uploads` as `multipart/form-data`, gets back a public Firebase Storage URL, and calls `onChange(url, path)`. Used inside transaction forms (Penjualan, Bahan, Gaji, Pengeluaran).

When a value is present, displays a thumbnail preview with **Ganti**, **Hapus**, and **Lihat** actions. When empty, displays a dashed dropzone with **Unggah Bukti** label and accepted formats hint.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| undefined` | — | Current uploaded URL (for thumbnail preview). Pass `undefined` to show dropzone. |
| `onChange` | `(url: string \| undefined, path: string \| undefined) => void` | — | Called after a successful upload (`url`, `path`) or after a remove (both `undefined`). Wire both into the form state — the path is needed for cleanup on delete. |
| `folder` | `"sales-receipts" \| "purchases-receipts" \| "salaries-receipts" \| "expenses-receipts"` | — | Storage folder prefix. The API automatically appends `YYYY/MM/{uuid}`. |
| `disabled` | `boolean` | `false` | Disables interaction (use during form submission). |
| `className` | `string` | — | Additional wrapper classes. |

### Validation

The API enforces:
- Content types: JPG, PNG, WEBP, HEIC
- Max size: 5 MB

Validation failures show as toast errors in Indonesian.

### Usage — basic (in a TanStack Form field)

```tsx
import { ReceiptUpload } from "@/components/shared/receipt-upload"

<form.Subscribe
  selector={(state) => state.values.receiptUrl}
  children={(receiptUrl) => (
    <ReceiptUpload
      value={receiptUrl}
      folder="sales-receipts"
      onChange={(url, path) => {
        form.setFieldValue("receiptUrl", url)
        form.setFieldValue("receiptPath", path)
      }}
    />
  )}
/>
```

### Usage — controlled component

```tsx
const [receipt, setReceipt] = useState<{ url?: string; path?: string }>({})

<ReceiptUpload
  value={receipt.url}
  folder="purchases-receipts"
  onChange={(url, path) => setReceipt({ url, path })}
/>
```

### Usage — with default value (edit form)

```tsx
<ReceiptUpload
  value={existingReceipt.url}
  folder="expenses-receipts"
  onChange={handleChange}
  disabled={mutation.isPending}
/>
```

---

## PageHeader

**Import:** `@/components/layouts/dashboard/page-header`

Standardized page/section header with Roboto Condensed title (28px semibold), description, back button, and optional action. Uses the project's standard section title pattern (`font-heading text-[28px] font-semibold leading-[1.2]` + `text-xs text-muted-foreground`).

### Props

| Prop          | Type           | Default  | Description                              |
| ------------- | -------------- | -------- | ---------------------------------------- |
| `title`       | `string`       | —        | Section title                            |
| `description` | `string`       | —        | Subtitle text                            |
| `action`      | `ReactNode`    | —        | Right-aligned action (e.g., button)      |
| `showBack`    | `boolean`      | `true`   | Show back button                         |
| `onBack`      | `() => void`   | `router.back()` | Custom back handler              |
| `className`   | `string`       | —        | Additional CSS classes                   |

### Usage

```tsx
import { PageHeader } from "@/components/layouts/dashboard/page-header"

// With back button (default)
<PageHeader title="User Details" description="View and edit user info" />

// Without back button
<PageHeader title="Dashboard" showBack={false} />

// With action
<PageHeader
  title="Orders"
  description="Manage your orders"
  action={<Button size="sm">Add Order</Button>}
/>

// Custom back handler
<PageHeader title="Step 2" onBack={() => router.push("/step-1")} />
```

---

## ChartCard

**Import:** `@/components/shared/chart-card`

Section wrapper for Recharts charts matching the Figma design (node `1778:2739`). Renders a Roboto Condensed heading and optional description above a white bordered card. The card wraps children in shadcn's `ChartContainer`, which provides CSS color variables for Recharts `var(--color-*)` references. Also re-exports `ChartConfig` for convenience.

### Props

| Prop             | Type                          | Default | Description                                                  |
| ---------------- | ----------------------------- | ------- | ------------------------------------------------------------ |
| `title`          | `string`                      | —       | Section heading (Roboto Condensed, 28px semibold)            |
| `description`    | `string`                      | —       | Subtitle below heading (12px, muted)                         |
| `config`         | `ChartConfig`                 | —       | Recharts color/label config passed to `ChartContainer`       |
| `chartClassName` | `string`                      | —       | Custom classes for `ChartContainer` (e.g., height override)  |
| `className`      | `string`                      | —       | Additional classes for the outer wrapper                     |
| `children`       | `ResponsiveContainer children` | —      | Recharts chart elements (`<BarChart>`, `<PieChart>`, etc.)   |

### Usage

```tsx
import { ChartCard } from "@/components/shared/chart-card"
import type { ChartConfig } from "@/components/shared/chart-card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  expenses: { label: "Expenses", color: "var(--chart-2)" },
} satisfies ChartConfig

// Bar chart
<ChartCard
  title="Revenue Overview"
  description="Monthly revenue and expenses"
  config={config}
>
  <BarChart data={data} barGap={4}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="month" tickLine={false} axisLine={false} />
    <YAxis tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
    <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
  </BarChart>
</ChartCard>

// Donut chart with custom height
<ChartCard
  title="Traffic Sources"
  description="Visitor breakdown by source"
  config={trafficConfig}
  chartClassName="aspect-square h-[300px]"
>
  <PieChart>
    <Pie data={data} dataKey="value" innerRadius={60} outerRadius={110} />
  </PieChart>
</ChartCard>

// Minimal — title only
<ChartCard title="Monthly Trend" config={config}>
  <BarChart data={data}>
    <Bar dataKey="value" fill="var(--color-value)" />
  </BarChart>
</ChartCard>
```

---

## TableCard

**Import:** `@/components/shared/table-card`

Simple static table card matching the Figma design (node `1681:11863`). Renders a Roboto Condensed section title and optional description OUTSIDE the card, then a bordered card containing a shadcn Table with sticky header, horizontal scroll, hover row highlight (`bg-table-row-highlight` / `#F1F5F9`), and optional pagination footer with total count and page navigation.

### Props

| Prop             | Type                      | Default              | Description                                                     |
| ---------------- | ------------------------- | -------------------- | --------------------------------------------------------------- |
| `title`          | `string`                  | —                    | Section heading (Roboto Condensed, 28px semibold)               |
| `description`    | `string`                  | —                    | Subtitle below heading (12px, muted)                            |
| `action`         | `ReactNode`               | —                    | Right-aligned action in header (e.g., Export button)            |
| `columns`        | `TableCardColumn<T>[]`    | —                    | Column definitions (key, header, optional render, className)    |
| `data`           | `T[]`                     | —                    | Array of row data objects                                       |
| `maxHeight`      | `string`                  | `"400px"`            | Max height of scroll container                                  |
| `minWidth`       | `string`                  | —                    | Min width for horizontal scroll (e.g., `"2400px"`)              |
| `className`      | `string`                  | —                    | Additional classes for the outer wrapper                        |
| `emptyMessage`   | `string`                  | `"No data available."` | Message shown when data is empty                              |
| `pageSize`       | `number`                  | —                    | Rows per page (enables pagination when combined with `showPagination`) |
| `showPagination` | `boolean`                 | `false`              | Show pagination footer with total count and page navigation     |

### TableCardColumn Interface

```tsx
interface TableCardColumn<T> {
  key: string                          // Property key on data object
  header: string                       // Column header text
  className?: string                   // Additional classes for th/td
  render?: (row: T) => React.ReactNode // Custom cell renderer
}
```

### Usage

```tsx
import { TableCard, type TableCardColumn } from "@/components/shared/table-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/shared/icon"

interface Order {
  orderId: string
  customer: string
  status: "completed" | "pending" | "processing" | "failed"
  total: string
  [key: string]: unknown
}

const columns: TableCardColumn<Order>[] = [
  { key: "orderId", header: "Order ID" },
  { key: "customer", header: "Customer" },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge type="status" value={row.status}>
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </Badge>
    ),
  },
  { key: "total", header: "Total" },
]

// Basic table with pagination
<TableCard
  title="Recent Orders"
  description="A list of recent orders."
  columns={columns}
  data={orders}
  showPagination
  pageSize={5}
/>

// With export action and horizontal scroll
<TableCard
  title="All Orders"
  description="Complete order history with all details."
  action={
    <Button variant="outline" size="sm" className="rounded-[4px]">
      <Icon name="download" size={16} />
      Export
    </Button>
  }
  columns={columns}
  data={orders}
  minWidth="2400px"
  maxHeight="420px"
  showPagination
  pageSize={10}
/>

// Simple table without pagination
<TableCard
  title="Top Customers"
  columns={columns}
  data={topCustomers}
/>
```

---

## DataTableCard

**Import:** `@/components/shared/data-table-card`

TanStack Table powered data table card matching the Figma design (node `1684:14851`). Renders a Roboto Condensed section title and optional description OUTSIDE the card, a toolbar row (search input left, filter/sort/columns buttons right), then a bordered card containing a TanStack Table with sticky header, horizontal scroll, hover row highlight, sorting indicators, and pagination footer. Supports column filters via dropdown menus, sort by dropdown, column visibility toggle, and global or per-column search.

### Props

| Prop               | Type                          | Default              | Description                                                     |
| ------------------ | ----------------------------- | -------------------- | --------------------------------------------------------------- |
| `title`            | `string`                      | —                    | Section heading (Roboto Condensed, 28px semibold)               |
| `description`      | `string`                      | —                    | Subtitle below heading (12px, muted)                            |
| `action`           | `ReactNode`                   | —                    | Right-aligned action in header (e.g., Export button)            |
| `columns`          | `ColumnDef<TData, TValue>[]`  | —                    | TanStack Table column definitions                               |
| `data`             | `TData[]`                     | —                    | Array of row data objects                                       |
| `searchKey`        | `string`                      | —                    | Column key for per-column search (omit for global filter)       |
| `searchPlaceholder`| `string`                      | `"Search..."`        | Search input placeholder text                                   |
| `filters`          | `DataTableFilter[]`           | —                    | Column filter dropdown configurations                           |
| `sortOptions`      | `DataTableSortOption[]`       | —                    | Sort by dropdown options                                        |
| `maxHeight`        | `string`                      | `"500px"`            | Max height of scroll container                                  |
| `minWidth`         | `string`                      | —                    | Min width for horizontal scroll (e.g., `"2200px"`)              |
| `className`        | `string`                      | —                    | Additional classes for the outer wrapper                        |
| `emptyMessage`     | `string`                      | `"No results."`      | Message shown when no data matches                              |
| `pageSize`         | `number`                      | `10`                 | Rows per page                                                   |
| `showPagination`   | `boolean`                     | `true`               | Show pagination footer                                          |
| `showSelectedCount`| `boolean`                     | `false`              | Show "X of Y selected" instead of "Y row(s) total"             |
| `showSearch`       | `boolean`                     | `true`               | Show search input in toolbar                                    |
| `showColumnFilter` | `boolean`                     | `true`               | Show Columns visibility toggle button                           |

### Filter & Sort Interfaces

```tsx
interface DataTableFilter {
  columnKey: string              // Column accessor key to filter
  label: string                  // Button label (e.g., "Status")
  options: DataTableFilterOption[] // Filter options
}

interface DataTableFilterOption {
  label: string                  // Display label (e.g., "Completed")
  value: string                  // Filter value (e.g., "completed")
}

interface DataTableSortOption {
  columnKey: string              // Column accessor key to sort
  label: string                  // Display label (e.g., "Customer")
}
```

### Usage

```tsx
import { type ColumnDef } from "@tanstack/react-table"
import { DataTableCard } from "@/components/shared/data-table-card"
import type { DataTableFilter, DataTableSortOption } from "@/components/shared/data-table-card"
import { Badge } from "@/components/ui/badge"

const columns: ColumnDef<Order>[] = [
  { accessorKey: "orderId", header: "Order ID", enableHiding: false },
  { accessorKey: "customer", header: "Customer" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge type="status" value={row.getValue("status")}>
        {row.getValue<string>("status")}
      </Badge>
    ),
    filterFn: (row, _id, filterValue) => {
      if (!filterValue) return true
      return row.getValue<string>("status") === filterValue
    },
  },
  { accessorKey: "total", header: "Total" },
]

const filters: DataTableFilter[] = [
  {
    columnKey: "status",
    label: "Status",
    options: [
      { label: "Completed", value: "completed" },
      { label: "Pending", value: "pending" },
    ],
  },
]

const sortOptions: DataTableSortOption[] = [
  { columnKey: "customer", label: "Customer" },
  { columnKey: "total", label: "Total" },
]

// Full-featured data table
<DataTableCard
  title="Recent Orders"
  description="Searchable, filterable data table."
  action={<Button variant="outline" size="sm">Export</Button>}
  columns={columns}
  data={orders}
  searchKey="customer"
  searchPlaceholder="Search customers..."
  filters={filters}
  sortOptions={sortOptions}
  minWidth="2200px"
  maxHeight="420px"
  pageSize={5}
/>

// Minimal — just search and pagination
<DataTableCard
  title="Users"
  columns={userColumns}
  data={users}
  searchKey="name"
  searchPlaceholder="Search users..."
  showColumnFilter={false}
/>

// Without search — filters only
<DataTableCard
  title="Transactions"
  columns={txColumns}
  data={transactions}
  showSearch={false}
  filters={txFilters}
  pageSize={20}
/>

// Scrollable mode — no pagination, all rows with vertical scroll (Figma node 1684:15140)
<DataTableCard
  title="Recent Orders"
  description="All rows visible with vertical scroll."
  columns={columns}
  data={orders}
  searchKey="customer"
  searchPlaceholder="Search customers..."
  filters={[statusFilter]}
  showPagination={false}
  showColumnFilter={false}
  minWidth="2200px"
  maxHeight="547px"
/>
```

---

## Icon

**Import:** `@/components/shared/icon`

Wrapper component for Google Material Symbols (Sharp variant). Renders a `<span>` with the Material Symbols font class and inline `font-variation-settings`. Replaces Lucide React icons throughout the project.

### Props

| Prop        | Type      | Default | Description                             |
| ----------- | --------- | ------- | --------------------------------------- |
| `name`      | `string`  | —       | Material Symbol name (snake_case)       |
| `size`      | `number`  | `20`    | Icon size in pixels (controls font-size, width, height) |
| `className` | `string`  | —       | Additional CSS classes (colors, spacing) |
| `fill`      | `boolean` | `false` | Use filled variant of the icon          |

### Usage

```tsx
import { Icon } from "@/components/shared/icon"

// Basic
<Icon name="dashboard" />

// Sized + colored
<Icon name="settings" size={16} className="text-muted-foreground" />

// Filled variant
<Icon name="star" size={24} fill />

// In a button
<Button variant="outline" size="sm">
  <Icon name="add" size={16} />
  Add Item
</Button>

// Common icon names:
// Navigation: dashboard, settings, chevron_right, arrow_back, menu
// Actions: add, edit, delete, search, refresh, close
// Status: check_circle, warning, error, info, cancel
// Content: inventory_2, monitoring, group, notifications
```

### Finding Icon Names

Browse available icons at [fonts.google.com/icons](https://fonts.google.com/icons). Select "Material Symbols" → "Sharp" style. Use the icon name in snake_case as the `name` prop.

---

## CerbrecIcon

**Import:** `@/components/shared/cerbrec-icon`

Custom SVG icon component for Cerbrec brand-specific icons. Works like `Icon` but renders inline SVGs instead of font glyphs. Uses `currentColor` for fill, so Tailwind color classes work.

### Props

| Prop        | Type              | Default | Description                        |
| ----------- | ----------------- | ------- | ---------------------------------- |
| `name`      | `CerbrecIconName` | —       | Icon name (kebab-case)             |
| `size`      | `number`          | `24`    | Icon size in pixels (width/height) |
| `className` | `string`          | —       | Additional CSS classes (colors, spacing) |

### Available Icons

| Name | Description |
|------|-------------|
| `construction-management` | Building with gear overlay |
| `cooling-agent` | Snowflake with wind lines |
| `cooling-optimization` | Cooling target with wind lines |
| `disaster-management` | Warning triangle with gear |
| `energy-cost-optimization` | Lightning bolt in refresh cycle |
| `energy-output-optimization` | Energy compass with gauge dots |
| `maintenance-agent` | Wrench in gear ring |
| `model-governance-agent` | Network/graph node diagram |
| `operations-agent` | Monitor with heartbeat line |
| `power-agent` | Gauge/speedometer needle |
| `power-grid-management` | Grid with lightning bolt |
| `predictive-maintenance` | Clock gauge with gear |
| `root-cause-analysis` | Search magnifier with nodes |

### Usage

```tsx
import { CerbrecIcon } from "@/components/shared/cerbrec-icon"

// Basic
<CerbrecIcon name="operations-agent" />

// Sized + colored
<CerbrecIcon name="cooling-agent" size={32} className="text-primary" />

// In a list or card
<CerbrecIcon name="power-agent" size={20} className="text-muted-foreground" />

// Iterate all icons
import { cerbrecIconNames } from "@/components/shared/cerbrec-icon"
{cerbrecIconNames.map(name => <CerbrecIcon key={name} name={name} />)}
```

---

## MetricCard

**Import:** `@/components/shared/metric-card`

Compact stats card for KPI dashboards. Displays a small label, large formatted value, optional Material Symbol icon (top-right), and an optional trend indicator with directional color coding. Uses shadcn Card primitives with no shadow and 2px border radius.

### Props

| Prop        | Type                                          | Default | Description                                      |
| ----------- | --------------------------------------------- | ------- | ------------------------------------------------ |
| `title`     | `string`                                      | —       | Small label above the value (e.g., "Revenue")    |
| `value`     | `string`                                      | —       | Pre-formatted display value (e.g., "$ 45,231")   |
| `icon`      | `string`                                      | —       | Material Symbol name (24px, top-right)           |
| `trend`     | `{ value: string; direction: "up" \| "down" }` | —       | Trend indicator with directional icon and color  |
| `className` | `string`                                      | —       | Additional CSS classes                           |

### Usage

```tsx
import { MetricCard } from "@/components/shared/metric-card"

// With icon and upward trend (green)
<MetricCard
  title="Revenue"
  value="$ 45,231"
  icon="attach_money"
  trend={{ value: "+23%", direction: "up" }}
/>

// With downward trend (red)
<MetricCard
  title="Bounce Rate"
  value="12.5%"
  icon="trending_down"
  trend={{ value: "-3.2%", direction: "down" }}
/>

// Without trend
<MetricCard
  title="Total Users"
  value="8,402"
  icon="group"
/>

// Minimal — title and value only
<MetricCard title="Uptime" value="99.9%" />

// In a 3-column grid (Figma METRIC CARD LIST layout)
<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
  <MetricCard title="Revenue" value="$ 45,231" icon="attach_money" trend={{ value: "+23%", direction: "up" }} />
  <MetricCard title="New Users" value="1,000" icon="group" trend={{ value: "+23%", direction: "up" }} />
  <MetricCard title="Churn" value="2.4%" icon="person_off" trend={{ value: "-12%", direction: "down" }} />
</div>
```

---

## PipelineCard

**Import:** `@/components/shared/pipeline-card`

Stage timeline card matching the Figma design (node `1781:3968`). Renders a Roboto Condensed section title OUTSIDE the card, then a bordered card body with an optional metrics row, a vertical step timeline with numbered circle avatars, dashed connector lines, status dots, and an optional output targets section with badges. Supports 4 step status states (completed, warning, error, pending) with exact Figma colors.

### Props

| Prop            | Type                | Default | Description                                              |
| --------------- | ------------------- | ------- | -------------------------------------------------------- |
| `title`         | `string`            | —       | Section heading (Roboto Condensed, 28px semibold)        |
| `description`   | `string`            | —       | Subtitle below heading (12px, muted)                     |
| `metrics`       | `PipelineMetric[]`  | —       | Optional metrics row at top of card (3-col grid)         |
| `steps`         | `PipelineStep[]`    | —       | Pipeline step definitions with status and optional info  |
| `outputTargets` | `string[]`          | —       | Optional badge labels for output targets section         |
| `className`     | `string`            | —       | Additional classes for the outer wrapper                 |

### Interfaces

```tsx
interface PipelineStep {
  name: string                                    // Step title (Sora 16px semibold)
  description: string                             // Step subtitle (Sora 14px, muted)
  status: "completed" | "warning" | "error" | "pending"  // Avatar & connector color
  latency?: string                                // Optional latency text (e.g., "12ms")
  dotColor?: "green" | "red" | "gray"             // Status dot color (defaults from status)
}

interface PipelineMetric {
  label: string      // Metric label (Sora 12px semibold, muted)
  value: string      // Metric value (Sora 30px semibold)
  sublabel: string   // Metric sublabel (Sora 12px, muted)
}
```

### Step Status States

| Status      | Avatar BG   | Avatar Border | Text/Line   | Default Dot |
| ----------- | ----------- | ------------- | ----------- | ----------- |
| `completed` | `#B0C1C6`   | `#8AA3AA`     | `#013847`   | green       |
| `warning`   | `#FFEDD5`   | `#FED7AA`     | `#F97316`   | green       |
| `error`     | `#FFE2E2`   | `#FECACA`     | `#D22D2D`   | red         |
| `pending`   | `#E6EBED`   | `#B0C1C6`     | `#557A84`   | gray        |

### Usage

```tsx
import { PipelineCard } from "@/components/shared/pipeline-card"
import type { PipelineStep, PipelineMetric } from "@/components/shared/pipeline-card"

// Data Processing Pipeline — with metrics, latency, output targets
<PipelineCard
  title="Data Processing Pipeline"
  description="Real-time data ingestion and transformation"
  metrics={[
    { label: "Throughput", value: "12.4K/s", sublabel: "records/sec" },
    { label: "Latency", value: "45ms", sublabel: "End-to-end" },
    { label: "Errors 24h", value: "23", sublabel: "Failed records" },
  ]}
  steps={[
    { name: "Data Ingestion", description: "Stream processing from multiple sources", status: "completed", latency: "12ms" },
    { name: "Validation", description: "Schema validation and type checking", status: "completed", latency: "8ms" },
    { name: "Transformation", description: "Data normalization and enrichment", status: "warning", latency: "18ms" },
    { name: "Feature Extraction", description: "ML feature computation pipeline", status: "completed", latency: "12ms" },
  ]}
  outputTargets={["PostgreSQL", "Redis Cache", "S3 Archive"]}
/>

// CI/CD Pipeline — steps only, no metrics, error + pending states
<PipelineCard
  title="CI/CD Pipeline"
  description="Build, test, and deploy workflow"
  steps={[
    { name: "Build", description: "Compile and bundle application", status: "completed" },
    { name: "Unit Tests", description: "Schema validation and type checking", status: "completed" },
    { name: "Integration Tests", description: "E2E browser testing", status: "completed" },
    { name: "Security Scan", description: "SAST and dependency audit", status: "error" },
    { name: "Deploy", description: "Production deployment", status: "pending" },
  ]}
/>

// Minimal — steps only
<PipelineCard
  title="ETL Pipeline"
  steps={[
    { name: "Extract", description: "Pull from sources", status: "completed" },
    { name: "Transform", description: "Clean and reshape", status: "completed" },
    { name: "Load", description: "Write to warehouse", status: "pending" },
  ]}
/>
```

---

## AnalysisPipelineCard

**Import:** `@/components/shared/analysis-pipeline-card`

Expandable workflow card with numbered step avatars, dashed connector lines, status badges, description text, detail metric badges, optional sub-steps section, and a "View Details" button per step. Auto-calculates a progress counter ("X of Y steps completed") from the steps array. Uses shadcn Card primitives. Designed for ML pipelines, ETL workflows, and multi-step analysis processes.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Section heading (28px Roboto Condensed, outside card) |
| `description` | `string` | — | Subtitle below heading (12px, muted) |
| `steps` | `AnalysisPipelineStep[]` | — | Array of workflow steps |
| `className` | `string` | — | Additional CSS classes |

### AnalysisPipelineStep Interface

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string` | — | Step name (16px bold) |
| `description` | `string` | — | Step description (14px, muted, max 2 lines) |
| `status` | `"completed" \| "in-progress" \| "pending"` | — | Step status — determines avatar style, badge color, and connector line color |
| `metrics` | `string[]` | — | Detail metric badges (e.g., "24.5K readings", "12 devices") |
| `substeps` | `string[]` | — | Optional sub-steps list rendered in a bordered box |
| `onViewDetails` | `() => void` | — | Callback for the "View Details" button |

### Status States

| Status | Avatar | Badge | Connector Line |
|--------|--------|-------|----------------|
| `completed` | Green circle (`#00E3A1`) with white checkmark | Green (`#DCFCE7` bg, `#16A34A` text) | `#00E3A1` |
| `in-progress` | Numbered circle (`#F1F5F9` bg, `#E2E8F0` border, `#64748B` text) | Orange (`#FFEDD5` bg, `#F97316` text) | `#CBD5E1` |
| `pending` | Numbered circle (same as in-progress) | Neutral (`#F5F5F5` bg, `#525252` text) | `#CBD5E1` |

### Usage

```tsx
import { AnalysisPipelineCard } from "@/components/shared/analysis-pipeline-card"
import type { AnalysisPipelineStep } from "@/components/shared/analysis-pipeline-card"

// ML Analysis Pipeline — mixed statuses with sub-steps
const mlSteps: AnalysisPipelineStep[] = [
  {
    name: "Data Ingestion",
    description: "Ingested 24,560 sensor readings from 12 devices across 3 zones.",
    status: "completed",
    metrics: ["24.5K readings", "12 devices", "3 zones"],
    substeps: [
      "Connected to MQTT broker for real-time data",
      "Validated schema for each sensor type",
      "Stored raw readings in time-series database",
    ],
  },
  {
    name: "Feature Engineering",
    description: "Extracted 48 features including statistical aggregates.",
    status: "completed",
    metrics: ["48 features", "5 transforms", "99.2% coverage"],
  },
  {
    name: "Anomaly Detection",
    description: "Running isolation forest and LSTM models.",
    status: "in-progress",
    metrics: ["2 models", "Processing..."],
  },
  {
    name: "Report Generation",
    description: "Generate analysis report and send alerts.",
    status: "pending",
  },
]

<AnalysisPipelineCard
  title="ML Analysis Pipeline"
  description="Anomaly detection workflow for sensor data"
  steps={mlSteps}
/>
```

```tsx
// ETL Pipeline — all completed, compact
const etlSteps: AnalysisPipelineStep[] = [
  {
    name: "Extract",
    description: "Extracted data from 5 sources.",
    status: "completed",
    metrics: ["5 sources", "1.2M rows"],
  },
  {
    name: "Transform",
    description: "Applied cleaning and schema mapping.",
    status: "completed",
    metrics: ["3 transforms", "99.8% valid"],
  },
  {
    name: "Load",
    description: "Loaded data into warehouse with integrity checks.",
    status: "completed",
    metrics: ["1.19M rows loaded", "42s duration"],
  },
]

<AnalysisPipelineCard
  title="ETL Pipeline"
  description="Extract, transform, and load data workflow"
  steps={etlSteps}
/>
```

---

## InsightCard

**Import:** `@/components/shared/insight-card`

Alert or recommendation card displaying a badge, title, and description. Shows a highlight background on hover. Supports a compact link variant (row layout with arrow icon) when `href` is provided. Uses shadcn Card primitives. The badge is passed as a `ReactNode` so consumers control badge content.

### Props

| Prop          | Type          | Default | Description                                            |
| ------------- | ------------- | ------- | ------------------------------------------------------ |
| `badge`       | `ReactNode`   | —       | Badge element (e.g., `<Badge type="risk" value="critical">`) |
| `title`       | `string`      | —       | Card title (18px semibold)                             |
| `description` | `string`      | —       | Card description (14px regular, muted color)           |
| `href`        | `string`      | —       | If provided, renders arrow icon and wraps card in Link |
| `className`   | `string`      | —       | Additional CSS classes                                 |

### Usage

```tsx
import { InsightCard } from "@/components/shared/insight-card"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/shared/icon"

// Default card (critical risk with warning icon)
<InsightCard
  badge={
    <Badge type="risk" value="critical">
      <Icon name="warning" size={14} />
      Critical Risk
    </Badge>
  }
  title="Security Update Required"
  description="A critical vulnerability has been identified in the cooling system firmware."
/>

// Default card (high risk)
<InsightCard
  badge={<Badge type="risk" value="high">High Risk</Badge>}
  title="Performance Degradation Detected"
  description="Server rack temperatures have exceeded optimal thresholds in Zone B."
/>

// Compact link variant (low risk, with arrow)
<InsightCard
  badge={<Badge type="risk" value="low">Low</Badge>}
  title="Maintenance Window Available"
  description="Scheduled maintenance can be performed during the upcoming low-traffic period."
  href="/maintenance"
/>
```

---

## Sonner Toast

**Import:** `sonner` (Toaster configured in `@/components/ui/sonner`)

Customized sonner toast notifications matching the Figma design system (node `1726:6372`). The `<Toaster>` component is mounted in the root layout. Use the `toast()` function from `sonner` to trigger toasts.

### Design Specs (Figma)

- **Background:** White (`var(--card)`) — same for all toast types
- **Border:** `var(--border)`, `border-radius: 10px`
- **Shadow:** `shadow-sm`
- **Padding:** `16px`, gap `8px`
- **Width:** `553px`
- **Icon:** Material Symbols `info` icon (20px) — same shape for all types, colored per type
- **Title:** `14px`, `font-weight: 600` (semibold)
- **Description:** `14px`, `#737373` (light) / `muted-foreground` (dark)
- **Action button:** `button-primary` bg (`#013341`), white text, `rounded-lg`, `px-4 py-2`
- **Cancel button:** `secondary` bg (`#F5F5F5`), foreground text, `rounded-lg`, `px-4 py-2`

### Type-Specific Title & Icon Colors

| Type | Light | Dark |
|------|-------|------|
| Default | `var(--card-foreground)` | `var(--card-foreground)` |
| Error | `#D22D2D` | `#F87171` |
| Success | `#16A34A` | `#4ADE80` |
| Warning | `#F97316` | `#FB923C` |

### Usage

```tsx
import { toast } from "sonner"

// Default with action + cancel
toast("Default Alert", {
  description: "This is the default alert style.",
  action: { label: "Action button", onClick: () => {} },
  cancel: { label: "Close", onClick: () => {} },
})

// Error with retry
toast.error("Error", {
  description: "Something went wrong. Please try again.",
  action: { label: "Try again", onClick: () => {} },
  cancel: { label: "Close", onClick: () => {} },
})

// Success with close only
toast.success("Success", {
  description: "Your changes have been saved successfully.",
  cancel: { label: "Close", onClick: () => {} },
})

// Warning with close only
toast.warning("Warning", {
  description: "This action cannot be undone.",
  cancel: { label: "Close", onClick: () => {} },
})

// Info
toast.info("Information", {
  description: "A new version is available.",
})

// Loading
toast.loading("Loading", {
  description: "Please wait...",
})
```

---

## ActionBar

**Import:** `@/components/shared/action-bar`

Sticky bottom bar for page-level or bulk actions. Fixed to the bottom of the content area (full width minus sidebar). Supports two modes: **bulk action mode** (with `selectedCount` — only renders when > 0, shows selection label and optional cancel button) and **page action mode** (always visible, with optional label and action buttons). Slides up with a fade-in animation. Consumer provides action buttons as `children`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedCount` | `number` | — | Number of selected items. When provided, bar only renders when > 0 |
| `label` | `string` | `"{count} items selected"` | Left-side label. Auto-generates from `selectedCount` when omitted |
| `onCancel` | `() => void` | — | When provided, renders a built-in Cancel button |
| `children` | `React.ReactNode` | — | Action buttons rendered on the right side |
| `className` | `string` | — | Additional CSS classes for the outer container |

### Usage

```tsx
import { ActionBar } from "@/components/shared/action-bar"

// Bulk action mode — with selection count, cancel, and actions
<ActionBar
  selectedCount={3}
  onCancel={() => setSelected(new Set())}
>
  <Button variant="secondary" size="sm">
    <Icon name="delete" size={16} />
    Delete
  </Button>
  <Button size="sm" className="bg-[oklch(0.637_0.178_168)] text-white">
    <Icon name="drive_file_move" size={16} />
    Move
  </Button>
</ActionBar>
```

```tsx
// Page action mode — always visible, no selection count
<ActionBar label="Unsaved changes">
  <Button variant="outline" size="sm" onClick={handleDiscard}>
    Discard
  </Button>
  <Button size="sm" onClick={handleSave}>
    Save Changes
  </Button>
</ActionBar>
```

```tsx
// Page action mode — no label, just buttons
<ActionBar>
  <Button variant="outline" size="sm" onClick={() => router.back()}>
    Back
  </Button>
  <Button size="sm" onClick={handleSubmit}>
    Submit
  </Button>
</ActionBar>
```

---

## InsightListCard

**Import:** `@/components/shared/insight-list-card`

Section-headed list card for insight and action items. Renders a Roboto Condensed heading and description above a bordered card containing stacked list items. Each item (`InsightListItem`) has a leading avatar slot, title, description, trailing slot (typically a priority badge), optional highlight, and optional click handler. Supports both structured mode (using `InsightListItem` components) and fully custom children.

### InsightListCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Section heading (28px Roboto Condensed, outside card) |
| `description` | `string` | — | Subtitle below heading (12px, muted) |
| `children` | `React.ReactNode` | — | `InsightListItem` components or custom content |
| `className` | `string` | — | Additional CSS classes |

### InsightListItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `avatar` | `React.ReactNode` | — | Leading element — typically a 40px circle with icon |
| `title` | `string` | — | Bold title text (16px semibold) |
| `description` | `string` | — | Muted description (14px regular) |
| `trailing` | `React.ReactNode` | — | Trailing element — typically a priority Badge |
| `onClick` | `() => void` | — | Click handler — adds cursor pointer |
| `className` | `string` | — | Additional CSS classes |

All items show a `#F8FAFC` hover background. Items with `onClick` also get `cursor-pointer`.

### Usage

```tsx
import { InsightListCard, InsightListItem } from "@/components/shared/insight-list-card"

// Structured mode — typed items with avatars and badges
<InsightListCard title="Action Items" description="Issues requiring attention">
  <InsightListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F1F5F9]">
        <Icon name="shield" size={24} className="text-[#64748B]" />
      </div>
    }
    title="Security Update Required"
    description="3 dependencies have known vulnerabilities."
    trailing={<Badge type="risk" value="critical">Critical</Badge>}
    onClick={() => router.push("/security")}
  />
  <InsightListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F1F5F9]">
        <Icon name="speed" size={24} className="text-[#64748B]" />
      </div>
    }
    title="Performance Optimization"
    description="Database queries taking 2x longer than baseline."
    trailing={<Badge type="risk" value="high">High</Badge>}
    onClick={() => router.push("/performance")}
  />
</InsightListCard>
```

```tsx
// Custom children — colored avatars, mixed badge usage
<InsightListCard title="Notifications" description="Recent alerts">
  <InsightListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#FFE2E2]">
        <Icon name="warning" size={24} className="text-[#D22D2D]" />
      </div>
    }
    title="Critical alert"
    description="Immediate action required"
    trailing={<Badge type="risk" value="critical">Critical</Badge>}
  />
  <InsightListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#EFF6FF]">
        <Icon name="info" size={24} className="text-[#3B82F6]" />
      </div>
    }
    title="Information"
    description="No action needed"
  />
</InsightListCard>
```

---

## ActivityLogCard

**Import:** `@/components/shared/activity-log-card`

Section-headed list card for activity log entries. Renders a Roboto Condensed heading and description above a bordered card containing stacked log items. Each item (`ActivityLogItem`) has a leading avatar slot, title, optional description, optional badge, a fixed-width right-aligned timestamp, optional highlight, and optional click handler. Very similar to InsightListCard but with timestamp as a first-class prop and badge + timestamp coexisting.

### ActivityLogCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Section heading (28px Roboto Condensed, outside card) |
| `description` | `string` | — | Subtitle below heading (12px, muted) |
| `children` | `React.ReactNode` | — | `ActivityLogItem` components or custom content |
| `className` | `string` | — | Additional CSS classes |

### ActivityLogItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `avatar` | `React.ReactNode` | — | Leading element — typically a 40px circle with icon |
| `title` | `string` | — | Bold title text (16px semibold) |
| `description` | `string` | — | Muted description below title (14px regular) |
| `badge` | `React.ReactNode` | — | Trailing badge element — e.g. "Review" badge |
| `timestamp` | `string` | — | Timestamp string — 96px fixed width, right-aligned (14px semibold muted) |
| `onClick` | `() => void` | — | Click handler — adds cursor pointer |
| `className` | `string` | — | Additional CSS classes |

All items show a `#F8FAFC` hover background. Items with `onClick` also get `cursor-pointer`.

### Usage

```tsx
import { ActivityLogCard, ActivityLogItem } from "@/components/shared/activity-log-card"

// Structured mode — simple activity entries with avatars and timestamps
<ActivityLogCard title="Recent Activity" description="Latest project changes">
  <ActivityLogItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F1F5F9]">
        <Icon name="person" size={24} className="text-[#64748B]" />
      </div>
    }
    title="Olivia Martin created project Dashboard v2"
    timestamp="21s ago"
    onClick={() => router.push("/activity/1")}
  />
  <ActivityLogItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F1F5F9]">
        <Icon name="edit" size={24} className="text-[#64748B]" />
      </div>
    }
    title="James Wilson updated API configuration"
    timestamp="2 hours ago"
  />
</ActivityLogCard>
```

```tsx
// Custom mode — colored avatars, descriptions, badges, and timestamps
<ActivityLogCard title="Deployments" description="Pipeline activity">
  <ActivityLogItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#DCFCE7]">
        <Icon name="check_circle" size={24} className="text-[#16A34A]" />
      </div>
    }
    title="Deploy succeeded"
    description="Production — v2.1.0"
    timestamp="32s ago"
    onClick={() => router.push("/deploys/latest")}
  />
  <ActivityLogItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#FFFBEB]">
        <Icon name="rate_review" size={24} className="text-[#D97706]" />
      </div>
    }
    title="Code review requested"
    description="PR #142 — Refactor auth module"
    badge={<Badge className="rounded-lg bg-[#FEF3C7] text-[#D97706]">Review</Badge>}
    timestamp="15 min ago"
  />
</ActivityLogCard>
```

---

## BorderListCard

**Import:** `@/components/shared/border-list-card`

Section-headed list card with border-separated items. Renders a Roboto Condensed heading and description above a bordered card containing stacked items. Each item (`BorderListItem`) has a leading avatar slot, content column (title in 18px Sora bold, optional description), optional trailing badge, and optional trailing arrow icon. The arrow auto-appears when `onClick` is provided, or can be controlled via `showArrow`. All items show a `#F8FAFC` hover background.

### BorderListCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Section heading (28px Roboto Condensed, outside card) |
| `description` | `string` | — | Subtitle below heading (12px, muted) |
| `children` | `React.ReactNode` | — | `BorderListItem` components or custom content |
| `className` | `string` | — | Additional CSS classes |

### BorderListItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `avatar` | `React.ReactNode` | — | Leading element — typically a 40px circle with initials or icon |
| `title` | `string` | — | Bold title text (18px Sora bold) |
| `description` | `string` | — | Muted description below title (14px regular) |
| `badge` | `React.ReactNode` | — | Trailing badge element — e.g. role badge |
| `showArrow` | `boolean` | — | Show trailing arrow icon. Auto-enabled when `onClick` is provided |
| `onClick` | `() => void` | — | Click handler — adds cursor pointer and trailing arrow |
| `className` | `string` | — | Additional CSS classes |

All items show a `#F8FAFC` hover background. Items with `onClick` also get `cursor-pointer` and a trailing `arrow_right_alt` icon (unless `showArrow={false}`).

### Usage

```tsx
import { BorderListCard, BorderListItem } from "@/components/shared/border-list-card"

// Structured mode — team members with initials avatars and role badges
<BorderListCard title="Team Members" description="4 members">
  <BorderListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F5F5F5] text-sm font-semibold">
        OM
      </div>
    }
    title="Olivia Martin"
    description="olivia@email.com"
    badge={
      <span className="rounded-lg bg-[#F1F5F9] px-2 py-0.5 text-xs font-semibold text-[#64748B]">
        Admin
      </span>
    }
    onClick={() => router.push("/members/olivia")}
  />
  <BorderListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F5F5F5] text-sm font-semibold">
        JL
      </div>
    }
    title="Jackson Lee"
    description="jackson@email.com"
    badge={
      <span className="rounded-lg bg-[#F1F5F9] px-2 py-0.5 text-xs font-semibold text-[#64748B]">
        Editor
      </span>
    }
  />
</BorderListCard>
```

```tsx
// Custom mode — icon avatars, green badge, trailing arrows
<BorderListCard title="Resources" description="Quick links">
  <BorderListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F8FAFC]">
        <Icon name="description" size={24} className="text-muted-foreground" />
      </div>
    }
    title="Custom border item"
    badge={
      <span className="rounded-lg bg-[#E6FEF7] px-2 py-0.5 text-xs font-semibold text-[#00B17E]">
        New
      </span>
    }
    onClick={() => router.push("/resources/1")}
  />
  <BorderListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F8FAFC]">
        <Icon name="folder" size={24} className="text-muted-foreground" />
      </div>
    }
    title="Another custom item"
    onClick={() => router.push("/resources/2")}
  />
</BorderListCard>
```

---

## ExpandedListCard

**Import:** `@/components/shared/expanded-list-card`

Section-headed accordion card where each item has a clickable trigger row that expands to reveal detail content. The trigger row supports an optional leading icon, title, subtitle, and badge, with a chevron that rotates 90° on expand. Built directly on base-ui Accordion primitives for full styling control. Items without `children` render as non-expandable plain rows (useful for navigation links). All items show `#F8FAFC` hover background.

### ExpandedListCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Section heading (28px Roboto Condensed, outside card) |
| `description` | `string` | — | Subtitle below heading (12px, muted) |
| `children` | `React.ReactNode` | — | `ExpandedListItem` components |
| `defaultValue` | `string[]` | — | Accordion values to expand by default |
| `className` | `string` | — | Additional CSS classes |

### ExpandedListItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Unique accordion identifier — required for expandable items |
| `icon` | `React.ReactNode` | — | Leading element — typically a 24px icon |
| `title` | `string` | — | Bold title text (18px Sora bold) |
| `subtitle` | `string` | — | Muted subtitle below title (14px regular) |
| `badge` | `React.ReactNode` | — | Optional badge next to title — e.g. Warning, Resolved |
| `children` | `React.ReactNode` | — | Expandable content — if provided, item becomes an accordion |
| `onClick` | `() => void` | — | Click handler for non-expandable items (link-style row) |
| `className` | `string` | — | Additional CSS classes |

Items with `children` are expandable accordion items. Items without `children` are plain rows (with optional `onClick` for navigation).

### Usage

```tsx
import { ExpandedListCard, ExpandedListItem } from "@/components/shared/expanded-list-card"

// Structured mode — items with icon, title, subtitle, expandable content
<ExpandedListCard title="Getting Started" description="Setup guides" defaultValue={["configure"]}>
  <ExpandedListItem
    value="configure"
    icon={<Icon name="settings" size={24} />}
    title="How to configure?"
    subtitle="Setup guide"
  >
    <p>
      Run <code className="rounded bg-[#E2E8F0] px-2 py-0.5 text-sm">pnpm setup:project</code> to
      configure app name, tagline, description, and backend URL.
    </p>
  </ExpandedListItem>
  <ExpandedListItem
    icon={<Icon name="api" size={24} />}
    title="How to add API routes"
    subtitle="API flows"
    onClick={() => router.push("/docs/api")}
  />
</ExpandedListCard>
```

```tsx
// Custom trigger mode — title + badge, no icon
<ExpandedListCard title="Advisories" description="Security and performance">
  <ExpandedListItem
    value="security"
    title="Security advisory"
    badge={<Badge className="rounded-lg bg-[#FEF3C7] text-[#D97706]">Warning</Badge>}
  >
    <p>3 dependencies have known vulnerabilities. Run <code>pnpm audit</code> to review.</p>
  </ExpandedListItem>
  <ExpandedListItem
    value="performance"
    title="Performance fix applied"
    badge={<Badge className="rounded-lg bg-[#DCFCE7] text-[#16A34A]">Resolved</Badge>}
  >
    <p>Database query optimization reduced latency by 40%.</p>
  </ExpandedListItem>
</ExpandedListCard>
```

---

## TimelineListCard

**Import:** `@/components/shared/timeline-list-card`

Section-headed list card with vertical dashed connector lines between items. Renders a Roboto Condensed heading and description above a bordered card. Each item (`TimelineListItem`) has a leading avatar slot, content box (title, description, optional badge, optional timestamp), and a dashed line connecting it to the next item. The content box has a hover background. The dashed connector is automatically hidden on the last item.

### TimelineListCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Section heading (28px Roboto Condensed, outside card) |
| `description` | `string` | — | Subtitle below heading (12px, muted) |
| `children` | `React.ReactNode` | — | `TimelineListItem` components or custom content |
| `className` | `string` | — | Additional CSS classes |

### TimelineListItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `avatar` | `React.ReactNode` | — | Leading element — typically a 40px colored circle with icon |
| `title` | `string` | — | Bold title text (16px semibold) |
| `description` | `string` | — | Muted description below title (14px regular) |
| `timestamp` | `string` | — | Timestamp string — 96px fixed width, right-aligned (14px semibold muted) |
| `badge` | `React.ReactNode` | — | Optional badge element — e.g. "Warning" badge |
| `onClick` | `() => void` | — | Click handler — makes content box interactive with cursor pointer |
| `className` | `string` | — | Additional CSS classes |

The content box (not the avatar) shows a `#F8FAFC` hover background. Items with `onClick` also get `cursor-pointer`. Dashed connector lines between avatars are hidden on the last item via `[&>*:last-child_.border-dashed]:hidden`.

### Usage

```tsx
import { TimelineListCard, TimelineListItem } from "@/components/shared/timeline-list-card"

// Structured mode — deployment timeline with avatars and timestamps
<TimelineListCard title="Recent Deployments" description="Pipeline activity">
  <TimelineListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#DCFCE7]">
        <Icon name="check_circle" size={24} className="text-[#16A34A]" />
      </div>
    }
    title="Production deployed"
    description="v2.1.0 — all checks passed"
    timestamp="32s ago"
    onClick={() => router.push("/deploys/latest")}
  />
  <TimelineListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#F8FAFC]">
        <Icon name="merge" size={24} className="text-[#64748B]" />
      </div>
    }
    title="Commit merged"
    description="feat: add dashboard charts"
    timestamp="2 hours ago"
    onClick={() => router.push("/commits/abc")}
  />
  <TimelineListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#FFFBEB]">
        <Icon name="warning" size={24} className="text-[#D97706]" />
      </div>
    }
    title="Build warning"
    description="Deprecated API usage detected"
    timestamp="5 days ago"
  />
</TimelineListCard>
```

```tsx
// Custom mode — items with badges, no timestamps
<TimelineListCard title="Events" description="System events">
  <TimelineListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#DCFCE7]">
        <Icon name="check_circle" size={24} className="text-[#16A34A]" />
      </div>
    }
    title="Custom timeline event"
    description="Inline detail block with custom content"
    onClick={() => {}}
  />
  <TimelineListItem
    avatar={
      <div className="flex size-10 items-center justify-center rounded-full bg-[#FFFBEB]">
        <Icon name="warning" size={24} className="text-[#D97706]" />
      </div>
    }
    title="Build warning"
    description="Inline detail block with custom content"
    badge={<Badge className="rounded-lg bg-[#FEF3C7] text-[#D97706]">Warning</Badge>}
  />
</TimelineListCard>
```

---

## StateCard

**Import:** `@/components/shared/state-card`

Centered state display for loading, error, and not-found scenarios. Renders an icon, optional title, optional description, and optional action slot inside a bordered container. Automatically renders an animated spinner when the icon is `progress_activity`. Designed to be placed inside cards, tables, or page areas to indicate empty/loading/error states.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | — | Material Symbol icon name. Use `"progress_activity"` for an animated loading spinner |
| `iconSize` | `number` | `32` | Icon size in px |
| `iconClassName` | `string` | — | Additional icon classes (e.g., color like `text-[#D22D2D]`) |
| `title` | `string` | — | Bold heading text (14px semibold) |
| `description` | `string` | — | Muted description below title (12px, centered) |
| `action` | `React.ReactNode` | — | Action slot — typically a Button |
| `className` | `string` | — | Additional CSS classes for the container |

### Usage

```tsx
import { StateCard } from "@/components/shared/state-card"

// Loading state — spinner with description
<StateCard
  icon="progress_activity"
  description="Fetching Data..."
/>
```

```tsx
// Error state — red icon, title, description, retry button
<StateCard
  icon="dangerous"
  iconSize={32}
  iconClassName="text-[#D22D2D]"
  title="Failed to load"
  description="Could not fetch data from server."
  action={
    <Button variant="outline" size="sm" onClick={handleRetry}>
      <Icon name="refresh" size={16} />
      Try again
    </Button>
  }
/>
```

```tsx
// Not found state — muted icon, title, description, back button
<StateCard
  icon="search_off"
  iconSize={32}
  iconClassName="text-[#979797]"
  title="User not found"
  description="The user does not exist."
  action={
    <Button variant="outline" size="sm" render={<Link href="/dashboard" />} nativeButton={false}>
      <Icon name="arrow_back" size={16} />
      Back to Dashboard
    </Button>
  }
/>
```

```tsx
// Empty state — generic with custom height
<StateCard
  icon="inbox"
  iconSize={32}
  iconClassName="text-muted-foreground"
  title="No results"
  description="Try adjusting your search or filters."
  className="h-[300px]"
/>
```

---

## StatusMetricCard

**Import:** `@/components/shared/status-metric-card`

Compact stats card with a label, large display value, subtitle, and an optional chart/sparkline slot on the right side. Designed for infrastructure and operational dashboards where each metric needs a visual trend. The card renders as a row with the text content filling available width and the chart occupying a fixed 142×90px area. Different from MetricCard — no icon or trend pill, but has a subtitle and chart slot instead.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Label text above the value (12px Sora regular, muted) |
| `value` | `string` | — | Large display value (24px Sora semibold, tight letter-spacing) |
| `subtitle` | `string` | — | Subtitle below the value (14px Sora bold, muted) |
| `chart` | `React.ReactNode` | — | Optional chart/sparkline element rendered on the right (142×90px area) |
| `className` | `string` | — | Additional CSS classes |

### Usage

```tsx
import { StatusMetricCard } from "@/components/shared/status-metric-card"

// Basic — no chart
<StatusMetricCard
  label="AVG Temperature"
  value="71.2° F"
  subtitle="68-77°F"
/>
```

```tsx
// With sparkline chart (Recharts AreaChart)
<StatusMetricCard
  label="Server Utilization"
  value="69.7%"
  subtitle="50 of 50"
  chart={
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="sparkGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="65%" stopColor="#C1F6DD" stopOpacity={1} />
            <stop offset="100%" stopColor="#C1F6DD" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke="#00B17E"
          strokeWidth={2}
          fill="url(#sparkGreen)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  }
/>
```

```tsx
// Grid layout — 3 columns for infrastructure dashboard
<div className="grid grid-cols-3 gap-2">
  <StatusMetricCard label="AVG Temperature" value="71.2° F" subtitle="68-77°F" chart={...} />
  <StatusMetricCard label="Server Utilization" value="69.7%" subtitle="50 of 50" chart={...} />
  <StatusMetricCard label="Daily Cost" value="$1,509" subtitle="Energy Costs" chart={...} />
</div>
```

---

## RecentActivityCard

**Import:** `@/components/shared/recent-activity-card`

Activity list card with section heading and bordered card containing stacked items. Each item (`RecentActivityItem`) displays a bold title (18px Sora) on top with a badges row below (category, metrics, timestamp) and a trailing `chevron_right` icon. All items show a `#F8FAFC` hover background and border separation between items.

### RecentActivityCard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Section heading (28px Roboto Condensed, outside card) |
| `description` | `string` | — | Subtitle below heading (12px, muted) |
| `children` | `React.ReactNode` | — | `RecentActivityItem` components or custom content |
| `className` | `string` | — | Additional CSS classes |

### RecentActivityItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Activity title (18px Sora bold) |
| `badges` | `React.ReactNode` | — | Badges row below title — category, metrics, timestamp badges |
| `onClick` | `() => void` | — | Click handler — adds cursor pointer |
| `className` | `string` | — | Additional CSS classes |

All items display a trailing `chevron_right` icon (24px, muted). Items with `onClick` get `cursor-pointer`. Hover background is `#F8FAFC` on all items.

### Usage

```tsx
import { RecentActivityCard, RecentActivityItem } from "@/components/shared/recent-activity-card"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@/components/shared/icon"

// Activity list with category, savings, and timestamp badges
<RecentActivityCard
  title="Recent Activity"
  description="Live infrastructure events and AI actions"
>
  <RecentActivityItem
    title="Reduced CRAC-DC1-Z1-01 setpoint by 2F during low-load period"
    badges={
      <>
        <Badge type="information">
          <Icon name="mode_cool" size={14} />
          Cooling Optimization
        </Badge>
        <Badge type="information">$25,000 estimated annual savings</Badge>
        <Badge type="information">Just now</Badge>
      </>
    }
    onClick={() => router.push("/activity/1")}
  />
  <RecentActivityItem
    title="UPS-DC1-03 battery capacity dropped below 80% threshold"
    badges={
      <>
        <Badge type="information">
          <Icon name="bolt" size={14} />
          Power Usage
        </Badge>
        <Badge type="information">High Priority</Badge>
        <Badge type="information">5 min ago</Badge>
      </>
    }
    onClick={() => router.push("/activity/2")}
  />
</RecentActivityCard>
```

---

<!-- DataCenter3D component removed in bookkeeping-mvp Phase 01 — not needed for finance app. -->

