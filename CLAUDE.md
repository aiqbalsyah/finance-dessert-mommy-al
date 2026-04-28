# CLAUDE.md

Dessert Mommyal Finance — Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui.

## Quick Reference

- Package manager: **pnpm** (never npm/yarn)
- File naming: **kebab-case** always
- Max file length: **500 lines**
- Imports: use `@/` path alias
- Fonts: **Sora** (sans), **Roboto Condensed** (headings), **Ubuntu Mono** (mono)
- Icons: **Google Material Symbols** (Sharp, via `components/shared/icon.tsx`)
- No Redux — TanStack Query for server state, React Context for client state
- Backend: Firebase Admin SDK (Firestore + Storage), no external HTTP backend
- Locale: **id-ID** (Indonesian) — `formatCurrency` returns `"Rp 25.000"`, dates show as `"15 Apr 2026"`
- UI text: **All visible labels in formal Indonesian** (bahasa baku). Code identifiers stay in English.
- Formatters: `lib/formatters/` — never use inline `toLocaleString()` or `new Date()`
- Numbers from Firestore: integer/decimal → format with `formatCurrency`, `formatCompactRupiah`, `formatPercent`, etc.
- Dates from Firestore: Unix timestamps (seconds) → format with `formatDate`, `formatRelativeTime`, `formatSmart`, etc.

## Commands

- `pnpm dev` — Start dev server
- `pnpm build` — Production build
- `pnpm lint` — Run ESLint

## Claude Skills

All skills enforce project architecture, read relevant docs before executing, and review code quality after.

| Skill | Description |
|---|---|
| `/start-init` | Read all docs and scan codebase to start a fresh session |
| `/setup-project` | Configure project name, tagline, description, backend URL + update docs |
| `/create-page` | Scaffold a new page (app route + feature content + doc updates) |
| `/create-api` | Scaffold a full API resource (types + service + API route + TanStack Query hook) |
| `/create-component` | Scaffold a new shared component with shadcn primitives |
| `/plan` | Create a structured implementation plan with numbered phases in `docs/planning/` |
| `/execute-plan` | Execute the next pending phase from a plan, verify build, mark progress |
| `/plan-status` | Check progress across all plans or a specific plan |

## Key Rules

- All `app/**/page.tsx` must be thin — only imports from `components/features/{page-name}/`
- All `app/**/layout.tsx` must be thin — only imports from `components/layouts/{layout-name}/`
- All `*-content.tsx` feature files must have `"use client"` directive
- Use route groups (e.g., `(dashboard)/`) for shared layouts without affecting URLs
- Layout components go in `components/layouts/{layout-name}/`
- Shared reusable components go in `components/shared/`
- Every data-fetching component: skeleton → loading/error/success
- **Data flow:** Component → `lib/api/` hook → `app/api/` route (thin) → `lib/use-cases/{resource}/` → `lib/repositories/{resource}/` → Firestore/Storage via `lib/firebase/`
- `app/api/` routes have NO logic — only call use cases and return responses
- Use cases orchestrate repos + storage; repositories do pure Firestore CRUD (extend `BaseRepository<T>`)
- All server-only files (`lib/firebase/`, `lib/repositories/`, `lib/use-cases/`) must `import "server-only"` at top
- Firebase Admin credentials live in env vars (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`) — server-only, never `NEXT_PUBLIC_`
- `components/ui/` is shadcn only — no custom components there
- Strong TypeScript — no `any`, all interfaces/types in `types/` folder
- Button rendering non-button elements (e.g., `<Link>`) must use `nativeButton={false}`

## shadcn/ui Notes

- Uses base-nova style with `render` prop (not `asChild`)
- `DropdownMenuLabel` must be inside `DropdownMenuGroup`
- Accordion uses `multiple` boolean prop (not Radix `type`)
- Card uses `shadow-sm` (not ring border)
- Button with `render` prop for non-button elements needs `nativeButton={false}`

## Auth

- Real Firebase Authentication (email + password). Web SDK from `@/lib/firebase/client` (client-only), Admin SDK helpers in `lib/services/auth/`.
- Auth context: `useAuth()` from `context/auth-provider.tsx` → `{ user, isAuthenticated, isLoading }`. `user.role` is one of `"admin" | "manager" | "kasir" | "viewer"`.
- Login: `useLogin()` does Web SDK signIn → POST ID token to `/api/auth/login` → server verifies + sets httpOnly cookie + returns Firestore profile.
- Logout: `useLogout()` does `signOut(authClient)` + POST `/api/auth/logout` (revokes + clears cookie).
- User profile in Firestore `users/{uid}` (must exist before login — first admin seeded manually via Firebase Console; subsequent users via `/pengaturan/pengguna` after Phase 05 of `auth-and-rbac`).
- Types: `types/auth.ts` (`User`, `UserRole`, `UserStatus`, `LoginPayload`, `loginPayloadSchema`).

## Docs

**Read the relevant docs before working on a feature area.** Each doc covers conventions, patterns, and examples you must follow.

Core docs:
- `docs/01-project-context.md` — Tech stack, fonts, env vars, routes, API routes
- `docs/02-architecture.md` — Folder structure, component architecture, providers, auth system, shared components
- `docs/03-api-data-flow.md` — Repository + Use Case + API route pattern, Firebase Admin, file uploads
- `docs/04-conventions.md` — Naming, shadcn notes, TypeScript, state, locale (Indonesian + Rupiah)
- `docs/05-forms.md` — TanStack Form + Zod + shadcn/ui patterns
- `docs/06-data-table.md` — TanStack Table, DataTableCard, shared components, table styling
- `docs/07-shared-components.md` — All shared components: usage, props, examples, creation guide

Planning docs (created via `/plan`):
- `docs/planning/{plan-name}/README.md` — Plan overview with phase table and status
- `docs/planning/{plan-name}/{NN}-{phase-name}.md` — Phase details, tasks, acceptance criteria
