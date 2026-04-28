import "server-only"

import { randomBytes } from "node:crypto"

import { getAuth } from "firebase-admin/auth"

import { getFirebaseApp } from "@/lib/firebase/admin"
import { usersRepository } from "@/lib/repositories/users"

import { UserNotFoundError } from "./errors"

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"

function generateTempPassword(length = 10): string {
  const bytes = randomBytes(length)
  let result = ""
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return result
}

export async function resetUserPassword(id: string): Promise<{ tempPassword: string }> {
  const existing = await usersRepository.findById(id)
  if (!existing) throw new UserNotFoundError(id)

  const tempPassword = generateTempPassword()
  await getAuth(getFirebaseApp()).updateUser(id, { password: tempPassword })
  await usersRepository.update(id, { mustChangePassword: true })

  return { tempPassword }
}
