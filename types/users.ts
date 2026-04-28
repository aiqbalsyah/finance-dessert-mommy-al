import * as z from "zod"

import type { BaseEntity } from "@/lib/repositories"

export type UserRole = "admin" | "manager" | "kasir" | "viewer"
export type UserStatus = "active" | "disabled"

export interface User extends BaseEntity {
  /** Firebase Auth UID — same as Firestore doc ID. */
  id: string
  email: string
  displayName: string
  role: UserRole
  status: UserStatus
  /** Set true on creation/admin reset; cleared once user changes their password. */
  mustChangePassword: boolean
  /** Optional, last successful login (Unix sec). */
  lastLoginAt?: number
}

const userRoleSchema = z.enum(["admin", "manager", "kasir", "viewer"], {
  message: "Role tidak valid.",
})

const userStatusSchema = z.enum(["active", "disabled"], {
  message: "Status tidak valid.",
})

export const userCreateSchema = z.object({
  email: z.email("Format email tidak valid."),
  displayName: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(80, "Nama maksimal 80 karakter."),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter.")
    .max(64, "Kata sandi maksimal 64 karakter."),
  role: userRoleSchema,
  status: userStatusSchema,
})

export const userUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, "Nama minimal 2 karakter.")
    .max(80, "Nama maksimal 80 karakter."),
  role: userRoleSchema,
  status: userStatusSchema,
}).partial()

export type CreateUserPayload = z.infer<typeof userCreateSchema>
export type UpdateUserPayload = z.infer<typeof userUpdateSchema>

export const userRoleLabels: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manajer",
  kasir: "Kasir",
  viewer: "Hanya Lihat",
}

export const userStatusLabels: Record<UserStatus, string> = {
  active: "Aktif",
  disabled: "Nonaktif",
}
