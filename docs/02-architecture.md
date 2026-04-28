# Architecture

## Folder Structure

```
├── app/                       # Next.js App Router — pages, layouts, routes
│   ├── api/                   # Next.js API routes (thin handlers — call use cases)
│   │   ├── accounts/          # Rekening CRUD endpoints (DELETE returns 409 if account has transactions)
│   │   ├── auth/              # Auth API routes (login, me, logout, clear-must-change-password)
│   │   ├── expenses/          # Pengeluaran CRUD endpoints (GET supports ?category=&from=&to=)
│   │   ├── products/          # Master Produk CRUD endpoints (GET supports ?active=true)
│   │   ├── purchases/         # Bahan CRUD endpoints (GET supports ?from=&to=)
│   │   ├── salaries/          # Gaji CRUD endpoints (GET supports ?period=&from=&to=)
│   │   ├── sales/             # Penjualan CRUD endpoints (GET supports ?from=&to=&productId=)
│   │   ├── reports/           # Aggregation endpoints (period-summary, account-balances, top-products, top-unsold-products, expense-breakdown)
│   │   ├── unsold-items/      # Barang Tidak Terjual CRUD endpoints (GET supports ?from=&to=&productId=, dates as YYYY-MM-DD strings)
│   │   ├── uploads/           # Receipt upload endpoint (multipart/form-data)
│   │   └── users/             # Pengguna CRUD + reset-password (Phase 04 enforces Admin-only via withAuth)
│   ├── (dashboard)/           # Route group — dashboard layout
│   │   ├── dashboard/         # Dashboard ringkasan keuangan — implemented in Phase 07
│   │   ├── penjualan/         # Penjualan — daftar + input transaksi penjualan — implemented in Phase 04
│   │   ├── bahan/             # Bahan — daftar + input pembelian bahan baku — implemented in Phase 05
│   │   ├── gaji/              # Gaji — daftar + input pembayaran gaji — implemented in Phase 05
│   │   ├── pengeluaran/       # Pengeluaran lain-lain — implemented in Phase 05
│   │   ├── barang-tidak-terjual/ # Input + daftar produk yang tidak terjual per tanggal — implemented in Phase 06
│   │   ├── master-produk/     # CRUD master produk — implemented in Phase 03
│   │   ├── rekening/          # CRUD rekening (bank dan cash) — implemented in Phase 02
│   │   ├── laporan/           # Laporan periode (P&L, breakdown, top produk) — implemented in Phase 07
│   │   └── pengaturan/
│   │       ├── pengguna/      # Manajemen pengguna (Admin only) — implemented in auth-and-rbac Phase 05
│   │       └── profil/        # Profil akun + ubah kata sandi (semua role) — implemented in auth-and-rbac Phase 08
│   ├── auth/                  # Auth pages — shared auth layout
│   │   └── login/             # Halaman login
│   └── page.tsx               # Root — redirect ke /dashboard
├── assets/                    # Static resources — images, icons, fonts
├── components/
│   ├── features/              # Page-specific components (one folder per route)
│   │   ├── bahan/             # Placeholder — implemented in Phase 05
│   │   ├── barang-tidak-terjual/ # Implemented in Phase 06 (renamed from barang-gak-laku — formal Indonesian)
│   │   ├── dashboard/         # Dashboard placeholder — implemented in Phase 07
│   │   ├── gaji/              # Placeholder — implemented in Phase 05
│   │   ├── laporan/           # Placeholder — implemented in Phase 07
│   │   ├── login/             # Login form (Indonesian labels)
│   │   ├── master-produk/     # Placeholder — implemented in Phase 03
│   │   ├── pengeluaran/       # Placeholder — implemented in Phase 05
│   │   ├── penjualan/         # Placeholder — implemented in Phase 04
│   │   ├── pengguna/          # Pengaturan → Pengguna (Admin-only user management) — auth-and-rbac Phase 05
│   │   ├── profil/            # Pengaturan → Profil — info akun + dialog ubah kata sandi — auth-and-rbac Phase 08
│   │   └── rekening/          # Placeholder — implemented in Phase 02
│   ├── layouts/               # Layout components
│   │   ├── auth/              # Auth layout (centered, logo)
│   │   └── dashboard/         # Dashboard shell (sidebar, header, nav, notifications, page-header)
│   ├── shared/                # Reusable components across pages
│   │   ├── action-bar.tsx     # Sticky bottom bar for page-level or bulk actions
│   │   ├── activity-log-card.tsx       # Section-headed list with avatar/title/badge/timestamp
│   │   ├── analysis-pipeline-card.tsx  # Expandable workflow steps with metrics
│   │   ├── border-list-card.tsx        # Border-separated list card
│   │   ├── cerbrec-icon.tsx            # Cerbrec brand SVG icons
│   │   ├── chart-card.tsx              # Card wrapper for Recharts (ChartContainer)
│   │   ├── data-table-card.tsx         # TanStack Table card (search, filter, sort, pagination)
│   │   ├── expanded-list-card.tsx      # Accordion list card
│   │   ├── icon.tsx                    # Material Symbols wrapper
│   │   ├── insight-card.tsx            # Alert/recommendation card
│   │   ├── insight-list-card.tsx       # List card for insights
│   │   ├── metric-card.tsx             # Stats card with trend pill
│   │   ├── pipeline-card.tsx           # Stage timeline card
│   │   ├── recent-activity-card.tsx    # Activity list card
│   │   ├── state-card.tsx              # Loading / error / empty state card
│   │   ├── status-metric-card.tsx      # Stats card with optional sparkline
│   │   ├── table-card.tsx              # Static table card with sticky header
│   │   └── timeline-list-card.tsx      # Timeline list with dashed connectors
│   └── ui/                    # shadcn/ui base components only
├── context/                   # React Context providers
│   ├── auth-provider.tsx      # Auth context (useAuth hook)
│   ├── query-provider.tsx     # TanStack Query client
│   └── theme-provider.tsx     # next-themes provider
├── data/                      # Static/mock data
│   └── notifications.ts       # Dummy notification data
├── docs/                      # Project documentation
│   └── planning/              # Implementation plans (created via /plan)
├── hooks/                     # Custom React hooks
│   └── use-mobile.ts          # Mobile/responsive detection hook
├── lib/
│   ├── auth/                  # RBAC toolkit (server + client split)
│   │   ├── get-current-user.ts # SERVER-ONLY — getCurrentUser + requireUser (React.cache for request-scoped caching)
│   │   ├── permissions-matrix.ts # CLIENT-SAFE — Permission union type, permissionsByRole, can() (data only)
│   │   ├── permissions.ts     # SERVER-ONLY — re-exports from matrix + adds requirePermission(), UnauthorizedError, ForbiddenError
│   │   ├── with-auth.ts       # SERVER-ONLY — HOF wrapper for App Router routes
│   │   └── index.ts           # Server-only barrel (use `permissions-matrix` directly on client)
│   ├── api/                   # TanStack Query hooks per resource (client-callable)
│   │   ├── accounts.ts        # Rekening hooks (useGetAccounts, useGetAccount, useCreateAccount, useUpdateAccount, useDeleteAccount)
│   │   ├── auth.ts            # Auth hooks (useCurrentUser, useLogin, useLogout)
│   │   ├── users.ts           # Pengguna hooks (useGetUsers, useGetUser, useCreateUser, useUpdateUser, useDeleteUser, useResetUserPassword)
│   │   ├── expenses.ts        # Pengeluaran hooks (useGetExpenses(filters?), useGetExpense, useCreateExpense, useUpdateExpense, useDeleteExpense)
│   │   ├── products.ts        # Master Produk hooks (useGetProducts({ active? }), useGetProduct, useCreateProduct, useUpdateProduct, useDeleteProduct)
│   │   ├── purchases.ts       # Bahan hooks (useGetPurchases(filters?), useGetPurchase, useCreatePurchase, useUpdatePurchase, useDeletePurchase)
│   │   ├── salaries.ts        # Gaji hooks (useGetSalaries(filters?), useGetSalary, useCreateSalary, useUpdateSalary, useDeleteSalary)
│   │   ├── sales.ts           # Penjualan hooks (useGetSales(filters?), useGetSale, useCreateSale, useUpdateSale, useDeleteSale)
│   │   ├── reports.ts         # Reports hooks (useGetPeriodSummary, useGetAccountBalances, useGetTopProducts, useGetTopUnsoldProducts, useGetExpenseBreakdown) + ReportPeriod type
│   │   ├── unsold-items.ts    # Barang Tidak Terjual hooks (useGetUnsoldItems(filters?), useGetUnsoldItem, useCreateUnsoldItem, useUpdateUnsoldItem, useDeleteUnsoldItem)
│   │   └── uploads.ts         # useUploadReceipt mutation (multipart/form-data POST)
│   ├── fetch/                 # Client-side fetch helper (fetchApi, ApiError)
│   ├── firebase/              # Firebase SDK initialization
│   │   ├── admin.ts           # Server-only — Lazy-init Firestore + Storage singletons (getDb, getDefaultBucket)
│   │   ├── client.ts          # CLIENT-ONLY (no `server-only` import) — Web SDK init for sign-in/out
│   │   ├── storage.ts         # Server-only — Upload/delete/signed URL helpers for Firebase Storage
│   │   └── index.ts           # Barrel export (server-only re-exports)
│   ├── formatters/            # Display formatting utilities
│   │   ├── date.ts            # Date formatters using date-fns (Unix timestamps → display strings)
│   │   ├── index.ts           # Re-exports all formatters
│   │   └── number.ts          # Number formatters (currency, compact, percent, bytes)
│   ├── repositories/          # Firestore data access layer per resource (server-only)
│   │   ├── accounts/          # AccountsRepository (extends BaseRepository<Account>) + findByCode
│   │   ├── base-repository.ts # BaseEntity (with optional createdBy/updatedBy Actor) + Actor type + BaseRepository<T> generic CRUD
│   │   ├── users/             # UsersRepository — createWithId (Firebase UID = doc ID), findByEmail, countAdmins
│   │   ├── expenses/          # ExpensesRepository + findByDateRange + findByCategory
│   │   ├── products/          # ProductsRepository + findActive
│   │   ├── purchases/         # PurchasesRepository + findByDateRange
│   │   ├── salaries/          # SalariesRepository + findByPeriod + findByDateRange
│   │   ├── sales/             # SalesRepository + findByDateRange + findByProduct
│   │   ├── unsold-items/      # UnsoldItemsRepository ("unsold_items" collection) + findByDateRange (string dates) + findByProduct
│   │   ├── base-repository.ts # Generic CRUD (create, findById, findAll, update, delete, count)
│   │   └── index.ts           # Barrel export — BaseRepository, BaseEntity, QueryOptions
│   ├── services/              # (Legacy) — being migrated to repositories + use-cases
│   │   ├── auth/              # Auth service (login, getCurrentUser, logout) — to migrate
│   │   ├── base.ts            # Base HTTP helpers (serviceGet, servicePost, etc.)
│   │   └── index.ts           # Re-exports base helpers
│   ├── use-cases/             # Business logic layer (server-only) — orchestrates repositories
│   │   ├── accounts/          # createAccount, listAccounts, getAccount, updateAccount, deleteAccount (with reference guard across sales/purchases/salaries/expenses) + AccountNotFoundError + AccountInUseError
│   │   ├── users/             # createUser (Firebase Auth + Firestore dual-write with rollback), listUsers, getUser, updateUser (last-admin guard), deleteUser (self + last-admin guards), resetUserPassword (10-char temp + mustChangePassword=true) + 4 typed errors
│   │   ├── expenses/          # createExpense, listExpenses({ category?, from?, to? }), getExpense, updateExpense, deleteExpense (cleans receipt) + ExpenseNotFoundError
│   │   ├── products/          # createProduct, listProducts({ active? }), getProduct, updateProduct, deleteProduct + ProductNotFoundError
│   │   ├── purchases/         # createPurchase, listPurchases({ from?, to? }), getPurchase, updatePurchase, deletePurchase (cleans receipt) + PurchaseNotFoundError
│   │   ├── salaries/          # createSalary, listSalaries({ period?, from?, to? }), getSalary, updateSalary, deleteSalary (cleans receipt) + SalaryNotFoundError
│   │   ├── sales/             # createSale (denormalizes productName), listSales, getSale, updateSale, deleteSale (cleans receipt) + SaleNotFoundError
│   │   ├── reports/           # Aggregation use cases (getPeriodSummary, getAccountBalances, getTopProducts, getTopUnsoldProducts, getExpenseBreakdown) — pure server-side compute over repos
│   │   ├── unsold-items/      # createUnsoldItem (denormalizes productName), listUnsoldItems, getUnsoldItem, updateUnsoldItem, deleteUnsoldItem + UnsoldItemNotFoundError
│   │   ├── uploads/           # uploadReceipt (validates type+size, makes public) + InvalidReceiptError + MAX_RECEIPT_SIZE_MB
│   │   └── README.md          # Pattern & conventions for use-case files
│   └── utils/                 # Utility functions
│       ├── cn.ts              # Tailwind class merge helper
│       └── index.ts           # Re-exports utils
├── public/                    # Public static files
├── scripts/                   # Project scripts
│   └── setup-project.mjs      # Interactive project setup (name, tagline, backend URL)
├── types/                     # TypeScript type definitions & interfaces
│   ├── accounts.ts            # Account, AccountType, payloads + Zod schemas + accountTypeLabels
│   ├── auth.ts                # Auth flow types (LoginPayload + Zod, LoginResponse, AuthState) — re-exports User from users.ts
│   ├── expenses.ts            # Expense, ExpenseCategory, payloads + Zod schemas + expenseCategoryLabels
│   ├── products.ts            # Product, ProductCategory, payloads + Zod schemas + productCategoryLabels
│   ├── purchases.ts           # Purchase, payloads + Zod schemas
│   ├── reports.ts             # PeriodSummary, AccountBalanceItem, TopProductItem, TopUnsoldProductItem, ExpenseBreakdownItem (DTO types only)
│   ├── salaries.ts            # Salary (with YYYY-MM period), payloads + Zod schemas
│   ├── sales.ts               # Sale (with productName/unitPrice snapshot), payloads + Zod schemas
│   ├── unsold-items.ts        # UnsoldItem (date as YYYY-MM-DD string), UnsoldReason enum, payloads + Zod schemas + unsoldReasonLabels
│   └── users.ts               # User (extends BaseEntity, id=Firebase UID), UserRole, UserStatus, payloads + Zod schemas + userRoleLabels + userStatusLabels
└── utils/                     # Helper functions
```

## Component Architecture

### Pages (`app/`)
- Page files should be thin — only import and render feature components
- No business logic or complex UI in page files
- Use `layout.tsx` to wrap pages with layout components
- Use route groups (e.g., `(dashboard)/`) to apply shared layouts without affecting the URL

### Features (`components/features/{page-name}/`)
- Each page has a corresponding folder in `components/features/`
- Group all page-specific components inside that folder
- Every `*-content.tsx` file must have `"use client"` directive
- Example: `app/(dashboard)/dashboard/page.tsx` → `components/features/dashboard/`

```
components/features/
├── bahan/
│   ├── bahan-content.tsx                # "use client" — orchestrates table + form dialog + delete confirmation
│   ├── bahan-form.tsx                   # TanStack Form + Zod — date/description/vendor/amount/account/note/receipt
│   ├── bahan-skeleton.tsx               # Loading skeleton
│   └── bahan-table.tsx                  # DataTableCard — Tanggal, Deskripsi, Vendor, Jumlah, Rekening, Bukti, Aksi
├── barang-tidak-terjual/
│   ├── barang-tidak-terjual-content.tsx # "use client" — orchestrates table + form dialog + delete confirmation
│   ├── barang-tidak-terjual-form.tsx    # TanStack Form + Zod — date/product/qty/reason/note (no money, no receipt)
│   ├── barang-tidak-terjual-skeleton.tsx # Loading skeleton
│   └── barang-tidak-terjual-table.tsx   # DataTableCard — Tanggal, Produk, Jumlah, Alasan (badge), Catatan, Aksi
├── dashboard/
│   ├── dashboard-account-balances.tsx   # Grid StatusMetricCard per rekening (Saldo Rekening section)
│   ├── dashboard-content.tsx            # "use client" — orchestrator (header + period picker + 5 sections)
│   ├── dashboard-expense-breakdown.tsx  # ChartCard with PieChart donut for pengeluaran per kategori
│   ├── dashboard-metrics.tsx            # 4 MetricCard (Omzet, Pengeluaran, Laba Bersih, Saldo Total)
│   ├── dashboard-skeleton.tsx           # Loading skeleton (4 metric + balances + 2 lists + chart)
│   ├── dashboard-top-products.tsx       # Top 5 produk terlaris list
│   ├── dashboard-top-unsold.tsx         # Top 5 produk tidak terjual terbanyak list
│   └── use-dashboard-period.ts          # Hook wrapping period preset state (defaults to "this-month")
├── gaji/
│   ├── gaji-content.tsx                 # "use client" — orchestrates table + form dialog + delete confirmation
│   ├── gaji-form.tsx                    # TanStack Form + Zod — date/employee/period/amount/account/note/receipt
│   ├── gaji-skeleton.tsx                # Loading skeleton
│   └── gaji-table.tsx                   # DataTableCard — Tanggal, Karyawan, Periode, Jumlah, Rekening, Bukti, Aksi
├── laporan/
│   ├── laporan-content.tsx              # "use client" — orchestrator (header + period picker + Tabs)
│   ├── laporan-expense-breakdown.tsx    # Pengeluaran per kategori dengan progress bar % share
│   ├── laporan-period-picker.tsx        # Wrapper around shared PeriodPicker (with width preset)
│   ├── laporan-pl.tsx                   # P&L statement (Pendapatan / Bahan / Gaji / Pengeluaran / Laba Bersih)
│   ├── laporan-skeleton.tsx             # Loading skeleton
│   ├── laporan-top-products.tsx         # Top 10 produk terlaris dengan ranking
│   └── laporan-top-unsold.tsx           # Top 10 produk tidak terjual terbanyak dengan ranking
├── login/
│   ├── login-form.tsx                   # Login form with useLogin mutation (Indonesian labels)
│   └── login-page-content.tsx           # "use client" — login page content
├── master-produk/
│   ├── master-produk-content.tsx        # "use client" — orchestrates table + form dialog + delete confirmation
│   ├── master-produk-form.tsx           # TanStack Form + Zod (create/edit) — Nama, Kategori, Harga, Status Aktif (Switch)
│   ├── master-produk-skeleton.tsx       # Loading skeleton
│   └── master-produk-table.tsx           # DataTableCard with columns Nama, Kategori (badge), Harga, Status, Aksi
├── pengeluaran/
│   ├── pengeluaran-content.tsx          # "use client" — orchestrates table + form dialog + delete confirmation
│   ├── pengeluaran-form.tsx             # TanStack Form + Zod — date/category/description/amount/account/note/receipt
│   ├── pengeluaran-skeleton.tsx         # Loading skeleton
│   └── pengeluaran-table.tsx            # DataTableCard — Tanggal, Kategori (badge), Deskripsi, Jumlah, Rekening, Bukti, Aksi
├── penjualan/
│   ├── penjualan-content.tsx            # "use client" — orchestrates table + form dialog + delete confirmation
│   ├── penjualan-form.tsx               # TanStack Form + Zod — date/product/qty/unitPrice/total/account/note/receipt
│   ├── penjualan-skeleton.tsx           # Loading skeleton
│   └── penjualan-table.tsx              # DataTableCard with columns Tanggal, Produk, Qty, Harga, Total, Rekening, Bukti, Aksi
└── rekening/
    ├── rekening-content.tsx             # "use client" — orchestrates table + form dialog + delete confirmation
    ├── rekening-form.tsx                # TanStack Form + Zod (create/edit) — Nama, Tipe, Kode, Saldo
    ├── rekening-skeleton.tsx            # Loading skeleton
    └── rekening-table.tsx                # DataTableCard with columns Nama, Kode, Tipe (badge), Saldo, Aksi
```

### Layouts (`components/layouts/{layout-name}/`)
- Reusable layout shells (sidebar, header, footer, etc.)
- Each route group in `app/` maps to a layout in `components/layouts/`

```
components/layouts/auth/
└── auth-layout.tsx               # Centered layout with logo for auth pages

components/layouts/dashboard/
├── app-sidebar.tsx               # Main sidebar with brand header, grouped nav, help footer, user menu (uses useAuth)
├── dashboard-header.tsx          # Sticky header with page title, conditional breadcrumbs, command palette trigger (⌘K), notification sheet
├── dashboard-layout.tsx          # Layout shell (SidebarProvider + AppSidebar)
├── nav-main.tsx                  # Grouped navigation with NavGroup[] support, active state highlighting (uses usePathname)
├── nav-user.tsx                  # User dropdown menu with account, notifications, theme toggle, logout
├── notification-sheet.tsx        # Notification sheet panel with unread count badge (triggered from header bell icon)
├── page-header.tsx               # Reusable page section header (title, description, back button, action)
└── team-switcher.tsx             # Team/workspace switcher in sidebar header
```

### Shared (`components/shared/`)
- Reusable components used across multiple pages
- Not page-specific, not layout-specific

```
components/shared/
├── action-bar.tsx              # Sticky bottom bar for page-level or bulk actions
├── audit-tooltip.tsx           # Wraps cell content with tooltip showing createdBy/updatedBy info from BaseEntity
├── period-picker.tsx           # PeriodPicker (Hari Ini/Minggu Ini/Bulan Ini/Bulan Lalu) + getPeriodRange + formatPeriodRange helpers
├── permission-guard.tsx        # Conditionally render children based on useAuth().can(permission) — UI sugar, NOT security
├── receipt-upload.tsx          # Image upload dropzone → POST /api/uploads → Firebase Storage
├── activity-log-card.tsx       # Section-headed list card for activity log entries with avatar, title, badge, timestamp
├── analysis-pipeline-card.tsx  # Expandable workflow card with step avatars, status badges, metrics
├── border-list-card.tsx        # Section-headed list card with border-separated items
├── cerbrec-icon.tsx            # Cerbrec custom SVG icon component (13 brand-specific icons)
├── chart-card.tsx              # Section wrapper with heading + bordered card for Recharts
├── data-table-card.tsx         # TanStack Table card with search, filters, sort, pagination
├── expanded-list-card.tsx      # Section-headed accordion card with expandable items
├── icon.tsx                    # Google Material Symbols wrapper (name, size, fill, className)
├── insight-card.tsx            # Alert/recommendation card with badge, title, description
├── insight-list-card.tsx       # Section-headed list card for insight items
├── metric-card.tsx             # Compact stats card with title, large value, icon, trend indicator
├── pipeline-card.tsx           # Stage timeline card with numbered avatars, metrics
├── recent-activity-card.tsx    # Activity list card with title, badges row, trailing chevron
├── state-card.tsx              # Centered state display for loading, error, empty, not-found states
├── status-metric-card.tsx      # Stats card with label, value, subtitle, optional sparkline
├── table-card.tsx              # Static table card with section title, sticky header, pagination
└── timeline-list-card.tsx      # Section-headed timeline list with dashed connector lines
```

### UI (`components/ui/`)
- shadcn/ui base components only — do not put custom components here

## Providers (Root Layout)

The root layout (`app/layout.tsx`) wraps all pages with:
1. `ThemeProvider` — next-themes (system/light/dark)
2. `QueryProvider` — TanStack Query client
3. `AuthProvider` — Auth context (useCurrentUser query, provides user data)
4. `TooltipProvider` — shadcn tooltip support

## Auth System

Real Firebase Authentication. The flow:

```
[Login form] → signInWithEmailAndPassword (Firebase Web SDK)
            → user.getIdToken()
            → POST /api/auth/login { idToken }
            → server: verifyIdToken (Firebase Admin) → lookup Firestore users/{uid}
            → reject if profile missing or status="disabled"
            → set httpOnly cookie 'auth-token' = ID token (7-day max-age)
            → return { user } (Firestore profile)
[Subsequent requests] cookie sent automatically
            → /api/auth/me reads cookie → verifyIdToken → lookup → return profile
[Logout] signOut (Firebase Web SDK) + POST /api/auth/logout → revokeRefreshTokens + clear cookie
```

**Components:**
- **Types**: `types/auth.ts` — `User` (Firestore profile, id=Firebase UID), `UserRole` (`admin|manager|kasir|viewer`), `UserStatus`, `LoginPayload` + Zod, `userRoleLabels`
- **Web SDK init**: `lib/firebase/client.ts` — singleton, exposed via `getFirebaseAuthClient()` (client-only)
- **Admin SDK helpers**: `lib/services/auth/index.ts` — `verifyIdToken`, `revokeRefreshTokens` (server-only)
- **User profile repo**: `lib/repositories/users/index.ts` — `usersRepository.findById(uid)` (Phase 02 extends with full CRUD)
- **API Routes**: `app/api/auth/` — `login` (POST verifies token + sets cookie), `me` (GET verifies cookie), `logout` (POST revokes + clears)
- **Hooks**: `lib/api/auth.ts` — `useCurrentUser`, `useLogin` (signs in via Web SDK first, then POSTs ID token), `useLogout`. Maps Firebase error codes to Indonesian messages.
- **Context**: `context/auth-provider.tsx` — `AuthProvider` + `useAuth()` returning `{ user, isAuthenticated, isLoading }`. Phase 06 will add `role` + `can()` helper.
- **Login form**: `components/features/login/login-form.tsx` — surfaces Firebase error messages via `login.error.message`.

### Manual seed for first user (one-time)

The very first admin must be seeded outside the app, since user-management UI doesn't ship until Phase 05:

1. Firebase Console → Authentication → Add User → enter email + password
2. Copy the new user's UID
3. Firebase Console → Firestore → Create collection `users` → Document ID = UID → fields:
   ```
   email: "<email>"
   displayName: "<nama>"
   role: "admin"
   status: "active"
   mustChangePassword: false
   createdAt: <unix-seconds-now>
   updatedAt: <unix-seconds-now>
   ```
4. Login at `/auth/login` with the same credentials → redirected to `/dashboard`

## Auth Layout Features

- **Centered**: Full-screen centered layout with `bg-muted`
- **Logo**: App icon + `NEXT_PUBLIC_APP_NAME` linking to `/`
- **Shared**: All pages under `app/auth/` inherit this layout

## Dashboard Layout Features

- **Sidebar**: White background, collapsible with icon mode, brand header with tooltip on collapse, active state (Oxford Blue bg) via usePathname
- **Navigation**: menu dalam 4 grup (Phase 06 of `auth-and-rbac` will filter per role):
  - **Utama**: Dashboard, Penjualan, Bahan, Gaji, Pengeluaran, Barang Tidak Terjual
  - **Master**: Master Produk, Rekening
  - **Laporan**: Laporan
  - **Pengaturan**: Pengguna (Admin-only)
- **Header**: White background (`bg-card`), sticky with page title or breadcrumbs, command palette trigger (⌘K), notification sheet with count badge
- **Page Header**: Reusable section header (Roboto Condensed title, description, back button, optional action) — semua label Indonesian
- **User Menu**: Akun, Notifikasi, Mode Terang/Gelap, Keluar — semua dalam Bahasa Indonesia
- **Theme**: System detection, toggle between light/dark via user dropdown menu

## Notification System

- **Data**: `data/notifications.ts` — Notification interface + dummy data (7 items, 4 types: info/warning/success/error)
- **Component**: `components/layouts/dashboard/notification-sheet.tsx` — Sheet panel triggered from header bell icon
- **Features**: Unread count badge (numeric, "9+" overflow), mark all read, mark individual read, type-based icons with color coding
