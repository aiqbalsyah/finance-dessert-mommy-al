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

export const loginPayloadSchema = z.object({
  email: z.email("Email tidak valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
})

export type LoginPayload = z.infer<typeof loginPayloadSchema>

export interface LoginResponse {
  user: User
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
