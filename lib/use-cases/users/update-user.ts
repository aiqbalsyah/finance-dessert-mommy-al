import "server-only"

import { getAuth } from "firebase-admin/auth"

import { getFirebaseApp } from "@/lib/firebase/admin"
import { usersRepository } from "@/lib/repositories/users"
import { userUpdateSchema, type UpdateUserPayload, type User } from "@/types/users"

import { LastAdminError, UserNotFoundError } from "./errors"

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
  const parsed = userUpdateSchema.parse(payload)
  const existing = await usersRepository.findById(id)
  if (!existing) throw new UserNotFoundError(id)

  // Last-admin guard: block if downgrading the last active admin.
  const isCurrentlyActiveAdmin =
    existing.role === "admin" && existing.status === "active"
  const willStopBeingActiveAdmin =
    isCurrentlyActiveAdmin &&
    ((parsed.role !== undefined && parsed.role !== "admin") ||
      (parsed.status !== undefined && parsed.status !== "active"))
  if (willStopBeingActiveAdmin) {
    const adminCount = await usersRepository.countAdmins()
    if (adminCount <= 1) throw new LastAdminError()
  }

  const auth = getAuth(getFirebaseApp())
  if (parsed.displayName !== undefined && parsed.displayName !== existing.displayName) {
    await auth.updateUser(id, { displayName: parsed.displayName })
  }
  if (parsed.status !== undefined && parsed.status !== existing.status) {
    await auth.updateUser(id, { disabled: parsed.status === "disabled" })
    if (parsed.status === "disabled") {
      await auth.revokeRefreshTokens(id).catch(() => undefined)
    }
  }

  const updates: Partial<User> = {}
  if (parsed.displayName !== undefined) updates.displayName = parsed.displayName.trim()
  if (parsed.role !== undefined) updates.role = parsed.role
  if (parsed.status !== undefined) updates.status = parsed.status

  return usersRepository.update(id, updates)
}
