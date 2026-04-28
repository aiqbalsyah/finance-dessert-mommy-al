import "server-only"

import type { UserRole } from "@/types/users"

import { can } from "./permissions-matrix"
import type { Permission } from "./permissions-matrix"

export { can, permissionsByRole, type Permission } from "./permissions-matrix"

export class UnauthorizedError extends Error {
  constructor() {
    super("Anda harus masuk.")
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("Anda tidak memiliki akses untuk tindakan ini.")
    this.name = "ForbiddenError"
  }
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!can(role, permission)) throw new ForbiddenError()
}
