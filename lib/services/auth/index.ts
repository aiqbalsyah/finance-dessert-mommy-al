import type { LoginPayload, LoginResponse, User } from "@/types/auth"
import { dummyUser, dummyToken } from "@/data/auth"

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // Dummy: accept any credentials, return mock user
  return {
    user: { ...dummyUser, email: payload.email },
    token: dummyToken,
  }
}

export async function getCurrentUser(token: string | undefined): Promise<User | null> {
  // Dummy: if token exists, return mock user
  if (!token) return null
  return dummyUser
}

export async function logout(): Promise<void> {
  // Dummy: no-op on server side
}
