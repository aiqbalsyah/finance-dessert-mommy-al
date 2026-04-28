import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"

import { usersRepository } from "@/lib/repositories/users"
import { verifyIdToken } from "@/lib/services/auth"
import type { User } from "@/types/users"

import { UnauthorizedError } from "./permissions"

/**
 * Resolve the current user from the auth cookie.
 *
 * Returns `null` when:
 * - cookie is missing
 * - token verification fails (expired, invalid, revoked)
 * - the Firestore profile is missing
 * - the user's status is "disabled"
 *
 * Cached per-request via React.cache so multiple callers in the same request
 * share one Firestore read + one token verification.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value
  if (!token) return null

  let uid: string
  try {
    const decoded = await verifyIdToken(token)
    uid = decoded.uid
  } catch {
    return null
  }

  const profile = await usersRepository.findById(uid)
  if (!profile) return null
  if (profile.status === "disabled") return null

  return profile
})

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()
  return user
}
