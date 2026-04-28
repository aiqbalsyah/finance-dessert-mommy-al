/**
 * Client-safe permission matrix.
 *
 * This file deliberately does NOT import "server-only" so it can be used in
 * client components (e.g. <PermissionGuard>, useAuth().can()). The companion
 * file `lib/auth/permissions.ts` is server-only and adds throw-helpers
 * (requirePermission) + error classes.
 */

import type { UserRole } from "@/types/users"

export type Permission =
  | "accounts:read"
  | "accounts:create"
  | "accounts:update"
  | "accounts:delete"
  | "products:read"
  | "products:create"
  | "products:update"
  | "products:delete"
  | "sales:read"
  | "sales:create"
  | "sales:update"
  | "sales:delete"
  | "purchases:read"
  | "purchases:create"
  | "purchases:update"
  | "purchases:delete"
  | "salaries:read"
  | "salaries:create"
  | "salaries:update"
  | "salaries:delete"
  | "expenses:read"
  | "expenses:create"
  | "expenses:update"
  | "expenses:delete"
  | "unsold-items:read"
  | "unsold-items:create"
  | "unsold-items:update"
  | "unsold-items:delete"
  | "reports:read"
  | "users:manage"
  | "uploads:write"

const adminPermissions: Permission[] = [
  "accounts:read", "accounts:create", "accounts:update", "accounts:delete",
  "products:read", "products:create", "products:update", "products:delete",
  "sales:read", "sales:create", "sales:update", "sales:delete",
  "purchases:read", "purchases:create", "purchases:update", "purchases:delete",
  "salaries:read", "salaries:create", "salaries:update", "salaries:delete",
  "expenses:read", "expenses:create", "expenses:update", "expenses:delete",
  "unsold-items:read", "unsold-items:create", "unsold-items:update", "unsold-items:delete",
  "reports:read",
  "users:manage",
  "uploads:write",
]

const managerPermissions: Permission[] = [
  "accounts:read", "accounts:create", "accounts:update",
  "products:read", "products:create", "products:update", "products:delete",
  "sales:read", "sales:create", "sales:update", "sales:delete",
  "purchases:read", "purchases:create", "purchases:update", "purchases:delete",
  "salaries:read", "salaries:create", "salaries:update", "salaries:delete",
  "expenses:read", "expenses:create", "expenses:update", "expenses:delete",
  "unsold-items:read", "unsold-items:create", "unsold-items:update", "unsold-items:delete",
  "reports:read",
  "uploads:write",
]

const kasirPermissions: Permission[] = [
  "accounts:read",
  "products:read",
  "sales:read", "sales:create", "sales:update", "sales:delete",
  "unsold-items:read", "unsold-items:create", "unsold-items:update", "unsold-items:delete",
  "uploads:write",
]

const viewerPermissions: Permission[] = [
  "accounts:read",
  "products:read",
  "sales:read",
  "purchases:read",
  "salaries:read",
  "expenses:read",
  "unsold-items:read",
  "reports:read",
]

export const permissionsByRole: Record<UserRole, ReadonlySet<Permission>> = {
  admin: new Set(adminPermissions),
  manager: new Set(managerPermissions),
  kasir: new Set(kasirPermissions),
  viewer: new Set(viewerPermissions),
}

export function can(role: UserRole, permission: Permission): boolean {
  return permissionsByRole[role].has(permission)
}
