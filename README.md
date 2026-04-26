# Dessert Mommyal Finance

Aplikasi pencatatan keuangan sederhana untuk bisnis Dessert Mommyal — mencatat penjualan, pembelian bahan, gaji karyawan, dan pengeluaran lainnya. Mendukung multi-rekening (A, B, C, Cash) dan upload bukti struk/pembayaran via Firebase Storage. Dibangun dengan Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, dan TanStack Query/Form/Table.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (base-nova style)
- **State Management:** TanStack Query (server state), React Context (client state)
- **Forms:** TanStack Form
- **Tables:** TanStack Table
- **Validation:** Zod
- **Charts:** Recharts
- **3D Visualization:** React Three Fiber + drei
- **Icons:** Lucide React
- **Fonts:** Rubik (sans), Ubuntu Mono (mono)
- **Package Manager:** pnpm

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using with Claude Code CLI

This project is fully configured for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — Anthropic's CLI tool for AI-assisted development.

### Quick Start

```bash
# Install Claude Code (if not installed)
npm install -g @anthropic-ai/claude-code

# Start Claude Code in the project root
claude

# Run the init command to load all project context
/start-init
```

### How Claude Remembers the Rules

Claude Code automatically reads **`CLAUDE.md`** at the project root on every session. This file contains:

- Quick reference for conventions (naming, imports, package manager)
- Key architectural rules (thin pages, API flow, component organization)
- shadcn/ui-specific patterns (base-nova style, `render` prop)
- Auth system overview
- Links to all documentation in `docs/`

For deeper context, run **`/start-init`** on a fresh session. This custom command tells Claude to:

1. Read all 10 documentation files in `docs/` and `docs/3d/`
2. Scan the project structure to understand current state
3. Check active plans in `docs/planning/`
4. Verify the build is healthy (`pnpm build`)
5. Report ready with a summary

After init, Claude will have full context about every convention, pattern, and component in the project.

### Available Claude Skills

All skills are prefixed with `CERBREC-UI:` and enforce the project architecture. They read relevant docs before executing and review code quality after.

| Skill | Description |
|---|---|
| `/start-init` | Read all docs and scan codebase to start a fresh session |
| `/setup-project` | Configure project name, tagline, description, backend URL + update docs |
| `/create-page` | Scaffold a new page (app route + feature content + doc updates) |
| `/create-api` | Scaffold a full API resource (types + service + API route + TanStack Query hook) |
| `/create-component` | Scaffold a new shared component with shadcn primitives |
| `/plan` | Create a structured implementation plan with numbered phases |
| `/execute-plan` | Execute the next pending phase, verify build, mark progress |
| `/plan-status` | Check progress across all plans or a specific plan |

### Planning Workflow

For larger features, use the planning system to break work into phases:

```bash
# 1. Create a plan with numbered phases
/plan

# 2. Execute phases one by one
/execute-plan user-management

# 3. Check progress at any time
/plan-status
```

Plans are stored in `docs/planning/{plan-name}/` with a README overview and numbered phase files. Each phase is independently shippable — the build must pass after every phase.

### Tips for Working with Claude Code

- Always run `/start-init` on a fresh session for full context
- Use `/plan` for features that span multiple files or require multiple steps
- Use `/create-page`, `/create-api`, `/create-component` for common scaffolding
- Claude will follow all rules in `CLAUDE.md` automatically
- Claude uses `pnpm` (never npm/yarn) as configured in `CLAUDE.md`
- Claude will use `@/` import aliases, kebab-case file names, and strict TypeScript

## Project Structure

```
├── .claude/commands/          # Claude Code skill definitions
├── api/                       # TanStack Query hooks per resource
│   └── auth.ts                # Auth hooks (useCurrentUser, useLogin, useLogout)
├── app/                       # Next.js App Router — pages, layouts, routes
│   ├── api/                   # API proxy routes to backend
│   │   └── auth/              # Auth routes (login, me, logout)
│   ├── (dashboard)/           # Route group — dashboard layout
│   │   ├── dashboard/         # Dashboard page
│   │   └── components/        # Components showcase page
│   └── auth/                  # Auth pages — shared auth layout
│       └── login/             # Login page
├── assets/                    # Static resources — images, icons, fonts
├── components/
│   ├── features/              # Page-specific components
│   ├── layouts/               # Layout components (auth, dashboard)
│   ├── shared/                # Reusable components (metric-card, data-table-card, scene-3d, etc.)
│   └── ui/                    # shadcn/ui base components only
├── context/                   # React Context providers (Auth, Query, Theme)
├── data/                      # Static/mock data, config
├── docs/                      # Project documentation
│   ├── 3d/                    # 3D visualization docs
│   └── planning/              # Implementation plans (created via /plan)
├── hooks/                     # Custom React hooks
├── lib/
│   ├── fetch/                 # Client-side fetch helper (fetchApi, ApiError)
│   ├── services/              # Backend API calls per resource
│   └── utils/                 # Utility functions (cn, grid-utils, etc.)
├── public/                    # Public static files
├── scripts/                   # Project scripts (setup, etc.)
├── types/                     # TypeScript type definitions & interfaces
└── utils/                     # Helper functions
```

## Key Architecture Rules

- **Pages are thin** — `app/**/page.tsx` only imports from `components/features/`
- **Layouts are thin** — `app/**/layout.tsx` only imports from `components/layouts/`
- **API routes are thin** — `app/api/` only calls services from `lib/services/`
- **Types go in `types/`** — never inline shared interfaces
- **Shared components in `components/shared/`** — never in `components/ui/` (shadcn only)
- **API flow:** Component → hook (`api/`) → API route (`app/api/`) → service (`lib/services/`) → backend

## Documentation

| Doc | Description |
|---|---|
| [Project Context](docs/01-project-context.md) | Tech stack, fonts, env vars, routes, API routes |
| [Architecture](docs/02-architecture.md) | Folder structure, component architecture, providers, auth system |
| [API & Data Flow](docs/03-api-data-flow.md) | API hooks, services, auth context, component pattern |
| [Conventions](docs/04-conventions.md) | Naming, shadcn notes, TypeScript, state, data fetching |
| [Forms](docs/05-forms.md) | TanStack Form + Zod + shadcn/ui patterns |
| [Data Table](docs/06-data-table.md) | TanStack Table, DataTableCard, shared components, table styling |
| [Shared Components](docs/07-shared-components.md) | All shared components: usage, props, examples, creation guide |
| [3D Visualization](docs/08-3d-visualization.md) | React Three Fiber setup, Scene3D, grid positioning, equipment patterns |
| [3D Component Architecture](docs/3d/component-architecture.md) | LayoutRenderer, Room, equipment units, directory structure |
| [3D Grid Positioning Rules](docs/3d/grid-positioning-rules.md) | Coordinate system, layer heights, rotation, aisle layout |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
