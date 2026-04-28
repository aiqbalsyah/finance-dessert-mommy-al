"use client"

import type { ReactNode } from "react"

import { useAuth } from "@/context/auth-provider"
import type { Permission } from "@/lib/auth/permissions-matrix"

interface PermissionGuardProps {
  /** Permission required to render `children`. */
  permission: Permission
  /** Rendered when the user lacks the permission. Defaults to `null` (hide). */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Conditionally renders children based on the current user's permissions.
 *
 * Use for action buttons (Tambah, Ubah, Hapus). For more complex logic
 * (e.g. show button in disabled state with tooltip), use `useAuth().can()`
 * inline instead.
 *
 * NOTE: This is UI sugar only. The real security boundary is `withAuth` in
 * API routes — never trust the client-side check alone.
 */
export function PermissionGuard({
  permission,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { can } = useAuth()
  if (!can(permission)) return <>{fallback}</>
  return <>{children}</>
}
