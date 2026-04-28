import "server-only"

import { getAuth, type DecodedIdToken } from "firebase-admin/auth"

import { getFirebaseApp } from "@/lib/firebase/admin"

export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  return getAuth(getFirebaseApp()).verifyIdToken(token)
}

export async function revokeRefreshTokens(uid: string): Promise<void> {
  await getAuth(getFirebaseApp()).revokeRefreshTokens(uid)
}
