import "server-only"

import { getAuth } from "firebase-admin/auth"

import { getFirebaseApp } from "@/lib/firebase/admin"
import { usersRepository } from "@/lib/repositories/users"

import { CannotDeleteSelfError, LastAdminError, UserNotFoundError } from "./errors"

export async function deleteUser(id: string, currentUserId: string): Promise<void> {
  if (id === currentUserId) throw new CannotDeleteSelfError()

  const existing = await usersRepository.findById(id)
  if (!existing) throw new UserNotFoundError(id)

  if (existing.role === "admin" && existing.status === "active") {
    const adminCount = await usersRepository.countAdmins()
    if (adminCount <= 1) throw new LastAdminError()
  }

  await usersRepository.delete(id)
  await getAuth(getFirebaseApp()).deleteUser(id).catch(() => {
    // Profile already gone — user can no longer log in. Auth record is orphan
    // until cleanup. Acceptable trade-off for MVP.
  })
}
