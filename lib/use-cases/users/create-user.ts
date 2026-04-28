import "server-only"

import { getAuth } from "firebase-admin/auth"

import { getFirebaseApp } from "@/lib/firebase/admin"
import { usersRepository } from "@/lib/repositories/users"
import { userCreateSchema, type CreateUserPayload, type User } from "@/types/users"

import { UserAlreadyExistsError } from "./errors"

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const parsed = userCreateSchema.parse(payload)
  const auth = getAuth(getFirebaseApp())

  let uid: string
  try {
    const created = await auth.createUser({
      email: parsed.email,
      password: parsed.password,
      displayName: parsed.displayName,
      disabled: parsed.status === "disabled",
    })
    uid = created.uid
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "auth/email-already-exists"
    ) {
      throw new UserAlreadyExistsError()
    }
    throw error
  }

  try {
    return await usersRepository.createWithId(uid, {
      email: parsed.email,
      displayName: parsed.displayName.trim(),
      role: parsed.role,
      status: parsed.status,
      mustChangePassword: true,
    })
  } catch (error) {
    // Best-effort rollback: delete the just-created Firebase Auth user so we
    // don't leave an orphan that can authenticate but has no Firestore profile.
    await auth.deleteUser(uid).catch(() => undefined)
    throw error
  }
}
