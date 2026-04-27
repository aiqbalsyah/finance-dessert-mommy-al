# Project Context

## Overview

Dessert Mommyal Finance — Aplikasi pencatatan keuangan sederhana untuk penjualan, pembelian bahan, gaji karyawan, dan pengeluaran lainnya. Mendukung multi-rekening (A, B, C, Cash) dan upload bukti struk via Firebase Storage. Dibangun dengan Next.js 16, TypeScript, Tailwind CSS v4, dan shadcn/ui.

## Tech Stack

- **Framework:** Next.js 16 (App Router, `app/` directory)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (base-nova style, uses `render` prop not `asChild`)
- **State Management:** TanStack Query (server state), React Context (client state)
- **Forms:** TanStack Form
- **Tables:** TanStack Table
- **Validation:** Zod
- **Charts:** Recharts
- **Icons:** Google Material Symbols (Sharp, Grade 0, Fill Off, Weight 400, 24px optical size)
- **Backend:** Firebase Admin SDK (Firestore + Storage) — server-side via Next.js API routes
- **Package Manager:** pnpm

## Fonts

- **Sans-serif:** Sora (via `next/font/google`) — body text, UI elements
- **Headings:** Roboto Condensed (via `next/font/google`) — large headings (H1, H2), available via `font-heading` Tailwind class
- **Monospace:** Ubuntu Mono (via `next/font/google`)

## Environment Variables

### Public (client + server)

| Variable                       | Description              | Default                 |
| ------------------------------ | ------------------------ | ----------------------- |
| `NEXT_PUBLIC_APP_NAME`         | App name (shown in UI & metadata) | `Dessert Mommyal Finance` |
| `NEXT_PUBLIC_APP_TAGLINE`      | App tagline (shown in sidebar header) | `Pencatatan Keuangan` |
| `NEXT_PUBLIC_APP_DESCRIPTION`  | App description (shown in UI & metadata) | (lihat `.env.local`) |

### Firebase Admin (server-side only — JANGAN beri prefix `NEXT_PUBLIC_`)

| Variable                  | Description                                              | Source |
| ------------------------- | -------------------------------------------------------- | ------ |
| `FIREBASE_PROJECT_ID`     | Firebase project ID                                      | Service account JSON `project_id` |
| `FIREBASE_CLIENT_EMAIL`   | Service account email                                    | Service account JSON `client_email` |
| `FIREBASE_PRIVATE_KEY`    | Service account private key (escape newlines as `\n`)    | Service account JSON `private_key` |
| `FIREBASE_STORAGE_BUCKET` | Default Firebase Storage bucket                          | Firebase Console → Storage |

> **Cara generate service account:**
> 1. Buka [Firebase Console](https://console.firebase.google.com/) → Project Settings → Service Accounts
> 2. Klik **Generate new private key** → download JSON
> 3. Copy `project_id`, `client_email`, dan `private_key` ke `.env.local` (private key dibungkus dengan `"..."` agar newline tetap terbaca, atau replace `\n` literal)
>
> **Architecture:** Tidak ada backend eksternal. Semua data flow lewat Next.js API routes (`app/api/`) → use case (`lib/use-cases/`) → repository (`lib/repositories/`) → Firestore via `lib/firebase/admin.ts`.

## Routes

| Route                | Route Group    | Description                        |
| -------------------- | -------------- | ---------------------------------- |
| `/`                  | —              | Redirect ke `/dashboard`           |
| `/auth/login`        | `auth/`        | Halaman login                      |
| `/dashboard`         | `(dashboard)/` | Ringkasan keuangan harian/bulanan (omzet, saldo per rekening, top produk) |
| `/penjualan`         | `(dashboard)/` | Daftar dan input transaksi penjualan |
| `/bahan`             | `(dashboard)/` | Daftar dan input pembelian bahan baku |
| `/gaji`              | `(dashboard)/` | Daftar dan input pembayaran gaji karyawan |
| `/pengeluaran`       | `(dashboard)/` | Daftar dan input pengeluaran lain-lain |
| `/barang-gak-laku`   | `(dashboard)/` | Input dan daftar produk yang tidak terjual per tanggal |
| `/master-produk`     | `(dashboard)/` | CRUD master produk                 |
| `/rekening`          | `(dashboard)/` | CRUD rekening (bank dan cash)      |
| `/laporan`           | `(dashboard)/` | Laporan periode (P&L, breakdown per kategori, top produk) |

## API Routes

| Route                  | Method | Description                                       |
| ---------------------- | ------ | ------------------------------------------------- |
| `/api/auth/login`      | POST   | Login (sets httpOnly cookie)                      |
| `/api/auth/me`         | GET    | Get current user                                  |
| `/api/auth/logout`     | POST   | Logout (clears cookie)                            |
| `/api/accounts`        | GET    | Daftar semua rekening (sorted by name asc)        |
| `/api/accounts`        | POST   | Tambah rekening baru                              |
| `/api/accounts/[id]`   | GET    | Detail satu rekening                              |
| `/api/accounts/[id]`   | PATCH  | Ubah rekening                                     |
| `/api/accounts/[id]`   | DELETE | Hapus rekening                                    |
