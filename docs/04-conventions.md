# Conventions

## File Naming
- Always use **kebab-case** for file names (e.g., `user-profile.tsx`, `data-table-header.tsx`)

## File Length
- **Max 500 lines** per file. If a component exceeds this, split into smaller components.

## Imports
- Use `@/` path alias for all imports (maps to project root)

## Components
- shadcn components live in `components/ui/` — do not add custom components there
- shadcn/ui uses base-nova style with `render` prop (not `asChild`)
- base-ui `DropdownMenuLabel` must be inside `DropdownMenuGroup`
- base-ui Accordion uses `multiple` boolean prop (not Radix `type="single"|"multiple"`)
- Client components must have `"use client"` directive at the top
- All `*-content.tsx` feature files must have `"use client"` directive
- Page files (`app/**/page.tsx`) should be thin — only import feature components
- Layout files (`app/**/layout.tsx`) should be thin — only import layout components
- Layout components go in `components/layouts/{layout-name}/`
- Feature components go in `components/features/{page-name}/`
- Shared reusable components go in `components/shared/`
- Use route groups (e.g., `(dashboard)/`) to apply shared layouts without affecting URLs

## Shared Components
- `components/shared/` — reusable components across multiple pages (being rebuilt from Figma)
- `components/layouts/dashboard/page-header.tsx` — standardized page section header (title, description, back button, action)
- Shared components must use shadcn/ui primitives (Card, Accordion, etc.) — not raw HTML
- Currently available: `icon.tsx` (Material Symbols), `cerbrec-icon.tsx` (brand icons)

## TypeScript
- Always use **strict TypeScript** — no `any` types
- All interfaces and types must be defined in `types/` folder (e.g., `types/auth.ts`)
- Use `interface` for object shapes, `type` for unions/intersections/primitives
- Export all types from their respective files in `types/`
- Component props should reference types from `types/` when shared across files
- Always type function parameters and return values

## State Management
- **Server state:** TanStack Query (useQuery, useMutation)
- **Client state:** React Context (e.g., AuthProvider, ThemeProvider)
- **No Redux** — not needed with TanStack Query

## Auth
- Auth state provided via `useAuth()` hook from `context/auth-provider.tsx`
- Login/logout via `useLogin()` / `useLogout()` mutations from `lib/api/auth.ts`
- Auth token stored in httpOnly cookie (set by API route, never client-side)
- Query key constants defined per resource (e.g., `authKeys.me`)

## Data Fetching
- Components never call Firestore or Storage directly — always lewat API route
- Flow: Component → TanStack Query hook (`lib/api/`) → Next.js API route (`app/api/`) → Use Case (`lib/use-cases/`) → Repository (`lib/repositories/`) → Firestore/Storage (`lib/firebase/`)
- `app/api/` routes are thin — no logic, only call use cases
- Use cases orchestrate repos + storage; repositories handle pure Firestore CRUD
- Every server-only file (`lib/firebase/`, `lib/repositories/`, `lib/use-cases/`) must `import "server-only"` di top
- Every data-fetching component must show a skeleton while loading
- Always handle loading, error, and success states

## Locale & Indonesian UI

**All user-facing UI text must be in formal Indonesian (bahasa baku).** Code identifiers (variable names, function names, type names, file names, Firestore field names) stay in English for collaboration consistency.

### Translation reference (common UI strings)

| English | Indonesian | Context |
|---------|------------|---------|
| Save | Simpan | Form submit |
| Cancel | Batal | Form/dialog cancel |
| Delete | Hapus | Destructive action |
| Edit | Ubah | Edit action |
| Add | Tambah | Add new resource |
| Upload | Unggah | File upload |
| Download | Unduh | File download |
| Search | Cari | Search input |
| Filter | Filter | Filter dropdown |
| Sort | Urutkan | Sort action |
| Loading | Memuat | Loading state |
| Error | Galat / Kesalahan | Error state |
| Failed to load | Gagal memuat | Error message |
| No data | Belum ada data | Empty state |
| No results | Tidak ada hasil | Empty filter result |
| Completed | Selesai | Status badge |
| Pending | Tertunda | Status badge |
| Failed | Gagal | Status badge |
| Active | Aktif | Status badge |
| Inactive | Tidak Aktif | Status badge |
| Account | Akun | User menu |
| Logout | Keluar | User menu |
| Notifications | Notifikasi | User menu / header |
| Settings | Pengaturan | User menu |
| Back | Kembali | Back button label |
| Confirm | Konfirmasi | Confirmation dialog |
| Yes | Ya | Confirmation |
| No | Tidak | Confirmation |

### Locale config

- **Currency:** `formatCurrency` defaults to `id-ID` / `IDR` → `"Rp 25.000"`. No decimal subunits.
- **Numbers:** `formatNumber` uses `id-ID` (dot for thousands, comma for decimals).
- **Dates:** All `formatDate*` functions use `date-fns/locale/id` → "15 Apr 2026", "15 April 2026", "Kemarin, 14:30".
- **Compact rupiah:** `formatCompactRupiah(1500000)` → `"Rp 1,5 jt"` for dashboards.
- **Time:** Default to 24h format (`HH:mm`) — common in Indonesian usage.

### What stays English

- File names: `sales-form.tsx`, `account-repository.ts`
- Variable / function / type names: `salesRepository`, `createSale`, `Account`, `useGetSales`
- Firestore field names: `productId`, `accountId`, `createdAt`
- Code comments and docstrings
- Documentation files (`docs/`)
- Commit messages and PR descriptions

## Data Formatting

All display formatting uses shared formatters from `lib/formatters/`. Never use inline `toLocaleString()`, `new Date()`, or manual formatting in components.

### Data Conventions
- **Numbers** from backend arrive as `integer` or `decimal` — use number formatters for display
- **Dates** from backend arrive as **Unix timestamps (seconds)** — use date formatters for display

### Number Formatters (`lib/formatters/number.ts`)

All formatters use `id-ID` locale by default (dot for thousands, comma for decimals).

| Function | Input | Output | Use Case |
|---|---|---|---|
| `formatNumber(1234567)` | `number` | `"1.234.567"` | General numbers |
| `formatCurrency(25000)` | `number` | `"Rp 25.000"` | Prices, revenue (no decimals) |
| `formatCompact(1234567)` | `number` | `"1,2 jt"` | Compact numbers (id-ID short scale) |
| `formatCompactRupiah(1500000)` | `number` | `"Rp 1,5 jt"` | Dashboard stats (compact Rupiah) |
| `formatPercent(0.156)` | `decimal` | `"15,6%"` | Percentages (value is 0-1) |
| `formatDecimal(3.14159, 2)` | `number` | `"3,14"` | Fixed decimal places |
| `formatBytes(1048576)` | `number` | `"1 MB"` | File sizes, storage |
| `formatWithSign(12.5)` | `number` | `"+12,5"` | Trend indicators |
| `formatInteger(1234)` | `number` | `"1.234"` | Whole numbers |

### Date Formatters (`lib/formatters/date.ts`)

All date functions accept a **Unix timestamp in seconds** and use `date-fns/locale/id`.

| Function | Output Example | Use Case |
|---|---|---|
| `formatDate(ts)` | `"15 Apr 2026"` | Default date display |
| `formatDateShort(ts)` | `"15 Apr"` (or `"15 Apr 2025"` if not this year) | Compact date |
| `formatDateTime(ts)` | `"15 Apr 2026, 14:30"` | Full date + 24h time |
| `formatDateTimeShort(ts)` | `"15 Apr, 14:30"` | Compact date + time |
| `formatTime(ts)` | `"14:30"` | Time only (24h) |
| `formatTime24(ts)` | `"14:30"` | 24-hour time |
| `formatRelativeTime(ts)` | `"5 menit yang lalu"` | Relative time (Indonesian) |
| `formatSmart(ts)` | `"14:30"` / `"Kemarin, 14:30"` / `"15 Apr, 14:30"` | Context-aware (Indonesian) |
| `formatISO(ts)` | `"2026-04-15"` | ISO format (locale-independent) |
| `formatCustom(ts, "dd/MM/yyyy")` | `"15/04/2026"` | Custom pattern (id locale) |

### Usage

```tsx
import { formatCurrency, formatRelativeTime } from "@/lib/formatters"

<span>{formatCurrency(order.amount)}</span>
<span>{formatRelativeTime(order.createdAt)}</span>
```

## Icons

- Use **Google Material Symbols** (Sharp variant) for all icons
- Import the shared wrapper: `import { Icon } from "@/components/shared/icon"`
- Icon names use Material Symbol names (snake_case): `"dashboard"`, `"chevron_right"`, `"check_circle"`
- Font loaded via `material-symbols/sharp.css` in `globals.css`
- Spec: Sharp style, Grade 0, Fill Off (default), Weight 400, Optical Size 24px
- Sizing via `size` prop (number in px), not Tailwind `size-*` classes
- Fill toggle via `fill` boolean prop
- Tailwind color classes work normally: `className="text-muted-foreground"`

```tsx
import { Icon } from "@/components/shared/icon"

// Basic usage
<Icon name="dashboard" />

// With size and color
<Icon name="settings" size={16} className="text-muted-foreground" />

// Filled variant
<Icon name="star" fill />
```

## Fonts
- Sans-serif: Sora (loaded via `next/font/google`, applied on `body`) — all body text and UI elements
- Headings: Roboto Condensed (loaded via `next/font/google`) — use `font-heading` Tailwind class for large headings (H1, H2)
- Monospace: Ubuntu Mono (loaded via `next/font/google`)

## Typography Scale

Use **standard Tailwind font sizes** (text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl) by default. One custom size is allowed:

- `text-2xs` — **10px / 14px line-height**. Reserved for the `Badge` component (and only the badge). Defined via `--text-2xs` in `app/globals.css` under `@theme inline`. Do not use it elsewhere — at 10px it falls below comfortable readability for body copy.

### Hierarchy (Responsive)

All text sizes use responsive Tailwind utilities with `md:` breakpoint to scale from mobile to desktop.

| Role | Mobile (default) | Desktop (md+) | Usage |
|------|-----------------|----------------|-------|
| Page header | `text-2xl` | `md:text-3xl` | PageHeader title — `font-heading text-2xl font-semibold md:text-3xl` |
| Section title | `text-lg` | `md:text-2xl` | ChartCard heading, showcase section titles — `font-heading text-lg font-semibold md:text-2xl` |
| Large card value | `text-2xl` | `md:text-3xl` | MetricCard value — `text-2xl font-semibold md:text-3xl` |
| Medium card value | `text-xl` | `md:text-2xl` | StatusMetricCard value — `text-xl font-semibold md:text-2xl` |
| Item title | `text-base` | `md:text-lg` | List item titles — `text-base font-semibold md:text-lg` |
| Card title | `text-base font-medium` | — | CardTitle default (no override needed) |
| Section description | `text-xs text-muted-foreground` | — | Subtitle below page/section title |
| Label / overline | `text-xs font-medium` | — | MetricCard labels, form labels |
| Body | `text-sm` | — | Most content, descriptions |
| Caption | `text-xs text-muted-foreground` | — | Comparisons, timestamps, metadata |
| Badge text | `text-2xs` | — | Badge component only — 10px custom size |

### Section Title Pattern

All section titles (below page-header level) use responsive Tailwind classes directly:

```tsx
<div className="flex flex-col gap-2">
  <h3 className="font-heading text-lg font-semibold md:text-2xl">Title</h3>
  <p className="text-xs text-muted-foreground">Description text</p>
</div>
```

For page-level headers (PageHeader component), use `font-heading text-2xl font-semibold md:text-3xl` — this is larger than section titles.

### Responsive Spacing

Padding and gaps also scale with `md:` breakpoint:

| Context | Mobile (default) | Desktop (md+) | Usage |
|---------|-----------------|----------------|-------|
| Page padding | `p-4` | `md:p-6` | Dashboard content, page wrappers |
| List item padding | `px-4 py-3` | `md:px-6 md:py-4` | BorderListItem, ActivityLogItem, etc. |
| Card inner padding | `p-4` | `md:p-6` | InsightCard, AlertItem, accordion panels |
| Section gap | `gap-6` | `md:gap-8 lg:gap-10` | Between major dashboard sections |
| Column gap | `gap-6` | `md:gap-8` | Dashboard two-column layout |

### Design Tokens

All reusable values are defined as CSS custom properties in `globals.css`. Never use hardcoded arbitrary Tailwind values (`text-[28px]`, `bg-[#hex]`, `rounded-[2px]`).

#### Sizing Tokens (Tailwind utilities via `@theme inline` / `@utility`)

| Utility | Value | Replaces |
|---------|-------|----------|
| `rounded-card` | `2px` | `rounded-[2px]` |
| `rounded-action` | `4px` | `rounded-[4px]` |
| `rounded-action-bar` | `12px` | `rounded-[12px]` |
| `h-chart` | `300px` | `h-[300px]` |
| `w-sparkline` | `142px` | `w-[142px]` |
| `h-sparkline` | `90px` | `h-[90px]` |
| `max-w-search` | `399px` | `max-w-[399px]` |
| `size-pipeline-dot` | `7px` | `size-[7px]` |
| `w-alerts-sidebar` | `514px` | `w-[514px]` |

#### Color Tokens (use `bg-*`, `text-*`, `border-*`)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `trend-positive` | `#16A34A` | `#4ADE80` | Green trend indicators |
| `trend-negative` | `#EF4444` | `#F87171` | Red trend indicators |
| `footer-bg` | `#F0F3F4` | `#1a1a1a` | SeeAllFooter background |
| `footer-text` | `#013847` | `#e0e0e0` | SeeAllFooter text |
| `footer-hover` | `#013847` | `#434343` | SeeAllFooter hover bg |
| `sparkline-stroke` | `#00B17E` | `#00B17E` | Sparkline line color |
| `sparkline-fill` | `#C1F6DD` | `#0d3d2e` | Sparkline gradient fill |

**Existing tokens to use instead of hardcoded values:**
- `border-border` instead of `border-[#E5E5E5]` (list separators)
- `bg-highlight` / `hover:bg-highlight` instead of `hover:bg-[#F8FAFC]` (hover backgrounds)

Pipeline status tokens (`pipeline-completed-*`, `pipeline-warning-*`, `pipeline-error-*`, `pipeline-pending-*`) and analysis pipeline tokens are also defined — see `globals.css` for full reference.

## Spacing Rhythm

Use intentional spacing variation — not uniform `gap-4` everywhere:

| Context | Spacing | Usage |
|---------|---------|-------|
| Between major sections | `mt-8` or `gap-8` | Different content areas (e.g., charts → bottom section) |
| Between related groups | `mt-6` or `gap-6` | Metrics → related chart, intro → content |
| Between items within a group | `gap-4` | Cards in a grid, list items |
| Within a card | `gap-2` to `gap-3` | Label → value, title → description |

## Brand Colors

Based on the Cerbrec Brand Guidelines. CSS values use hex format for accuracy.

### Two Color Systems

The project uses two color sources:

1. **Brand palette** (`color.theme.json`) — Neutrals, Primary (emerald), Secondary (teal), Status (success/warning/danger). Used for theme tokens: `--background`, `--foreground`, `--primary`, `--sidebar`, `--success`, `--warning`, `--danger`, etc.
2. **Tailwind defaults** — Used in Figma for badge component colors (green-100, amber-100, blue-100, etc.). These are the exact colors from the Figma design system badge specs.

**Rule:** Always follow the colors specified in the Figma design. If Figma uses Tailwind defaults for a component, use those exact hex values. If Figma uses brand colors, use brand colors.

### Primary Palette

| Color | Hex | Role |
|-------|-----|------|
| Vivid Emerald | `#00F9B1` | Primary accent, focus rings, active states (10% usage) |
| Oxford Blue | `#013341` | Button primary, sidebar active state (10% usage) |
| White | `#FFFFFF` | Sidebar, header, card backgrounds (60% usage) |
| Light Gray | `#F5F5F5` | Page background, secondary surfaces (30% usage) |
| Dark Gray | `#1D1D1D` | Foreground text, dark surfaces |

### Color Tokens

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `primary` | Vivid Emerald `#00F9B1` | `#1ee6ac` |
| `button-primary` | Oxford Blue `#013341` | `#0d5563` |
| `button-primary-foreground` | `#FAFAFA` | `#FAFAFA` |
| `secondary` | Neutral-100 `#F5F5F5` | `#434343` |
| `sidebar` | White `#FFFFFF` | Card dark `#282828` |
| `sidebar-primary` | Oxford Blue `#013341` | `#0d5563` |
| `sidebar-accent` | Neutral-100 `#F5F5F5` | `#434343` |
| `destructive` | Danger-500 | Danger-500 (dark) |
| `accent-warm` | Primary-600 (muted emerald) | Primary-700 |
| `accent-cool` | Secondary-400 (muted blue) | Secondary-300 |

### Button Primary Token

Figma Primary button uses Oxford Blue (`#013341`), NOT Vivid Emerald. The `--button-primary` token is separate from `--primary` (which stays emerald for focus rings, badges, accents).

```tsx
// Button default variant uses button-primary token
<Button>Primary Action</Button>              // Oxford Blue bg, white text
<Button variant="secondary">Cancel</Button>  // Neutral gray bg, dark text
```

### Status Colors

Three-level status tokens (`50` = background tint, `500` = main, `900` = dark/text):

| Token | Usage |
|-------|-------|
| `success` / `success-50` / `success-500` / `success-900` | Completed actions, positive states |
| `warning` / `warning-50` / `warning-500` / `warning-900` | Caution, non-critical issues |
| `danger` / `danger-50` / `danger-500` / `danger-900` | Errors, destructive actions, critical states |

Use via Tailwind: `bg-success/10`, `text-warning`, `bg-danger-50`, `text-danger-900`, etc.

### Badge Color Tokens

Dedicated badge variant colors — soft pastel backgrounds with saturated foreground text. Colors match **Figma design system** (Tailwind defaults). Used via `bg-badge-*` / `text-badge-*-foreground` Tailwind classes.

| Token | Light BG | Light FG | Tailwind Source |
|-------|----------|----------|-----------------|
| `badge-secondary` | `#F5F5F5` | `#525252` | neutral-100 / neutral-600 |
| `badge-warning` | `#FEF3C7` | `#D97706` | amber-100 / amber-600 |
| `badge-success` | `#DCFCE7` | `#16A34A` | green-100 / green-600 |
| `badge-destructive` | `#FFE2E2` | `#EF4444` | red-100 / red-500 |
| `badge-info` | `#DBEAFE` | `#3B82F6` | blue-100 / blue-500 |
| `badge-accent` | `#FFEDD5` | `#F97316` | orange-100 / orange-500 |
| `badge-muted` | `#F1F5F9` | `#64748B` | slate-100 / slate-500 |

### Badge Type System (Figma node `1726:6371`)

Badge supports a `type` + `value` prop system that maps semantic meaning to the correct color variant:

| Type | Value | → Variant | Color |
|------|-------|-----------|-------|
| `status` | `processing` | secondary | neutral gray |
| `status` | `pending` | warning | amber |
| `status` | `completed` | success | green |
| `status` | `failed` | destructive | red |
| `priority` | `low` | secondary | neutral gray |
| `priority` | `medium` | info | blue |
| `priority` | `high` | accent | orange |
| `priority` | `critical` | destructive | red |
| `risk` | `low` | secondary | neutral gray |
| `risk` | `medium` | warning | amber |
| `risk` | `high` | accent | orange |
| `risk` | `critical` | destructive | red |
| `information` | — | muted | slate |

```tsx
// Type system — auto-resolves to correct color
<Badge type="status" value="completed">Completed</Badge>
<Badge type="priority" value="critical">Critical</Badge>
<Badge type="risk" value="high">High Risk</Badge>
<Badge type="information"><Icon name="bolt" size={14} />Power Usage</Badge>

// Raw variant — still works for custom use
<Badge variant="success">Custom</Badge>
```

**All 11 Badge Variants:**

| Variant | Style | Use Cases |
|---------|-------|-----------|
| `default` | Vivid Emerald bg | Primary action badges |
| `secondary` | Neutral gray bg | Processing, Low priority/risk |
| `destructive` | Red tint bg | Failed, Critical |
| `success` | Green tint bg | Completed, Resolved |
| `warning` | Amber tint bg | Pending, Medium risk |
| `info` | Blue tint bg | Medium priority, Informational |
| `accent` | Orange tint bg | High priority/risk |
| `muted` | Slate tint bg | Information labels, metadata |
| `outline` | Border only | Outlined badges |
| `ghost` | Transparent, hover bg | Subtle badges |
| `link` | Text with underline | Clickable text badges |

### Component Tokens

Shared component-level color tokens for highlighted states and table styling.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `highlight` | `#F8FAFC` | `#1a1f25` | MetricCard featured bg, InsightCard highlight bg |
| `highlight-border` | `#D4D4D4` | `#525252` | Highlighted card border, export button border |
| `table-header` | `#F5F5F5` | `#1a1a1a` | Table header row background |
| `table-row-highlight` | `#F1F5F9` | `#1e293b` | First-column or highlighted row bg |

```tsx
// Usage via Tailwind classes
<div className="bg-highlight border-highlight-border">Featured card</div>
<th className="bg-table-header">Column</th>
```

### Chart Colors

Five chart color tokens matching the Figma donut chart palette (node `1778:2739`). Derived from the Oxford Blue + Vivid Emerald brand colors.

| Token | Light Mode | Hex | Dark Mode | Purpose |
|-------|-----------|-----|-----------|---------|
| `chart-1` | Oxford Blue | `#013341` | `#0d5563` | Primary data series |
| `chart-2` | Vivid Emerald | `#00F9B1` | `#1ee6ac` | Secondary data series |
| `chart-3` | Dark Green | `#008961` | `#4ADE80` | Tertiary / accent |
| `chart-4` | Muted Teal | `#557A84` | `#7b9aa2` | Quaternary series |
| `chart-5` | Near-black Teal | `#00181E` | `#34606c` | Quinary series |

Use in `ChartConfig` via CSS variables:
```tsx
const chartConfig = {
  series1: { label: "Revenue", color: "var(--chart-1)" },
  series2: { label: "Expenses", color: "var(--chart-2)" },
} satisfies ChartConfig
```

For charts with only 1-2 series, prefer semantic tokens: `var(--color-primary)`, `var(--color-muted-foreground)`.

### Accent Tokens

| Token | Usage |
|-------|-------|
| `accent-warm` | Brand-derived emerald — highlight accents, tinted backgrounds |
| `accent-cool` | Brand-derived teal/blue — secondary accents, borders |

Use via Tailwind: `border-accent-warm`, `text-accent-cool`, `bg-accent-warm/10`, etc.

## Package Manager
- Always use **pnpm** (not npm or yarn)
