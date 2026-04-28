import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FirebaseError } from "firebase/app"
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth"

import { fetchApi } from "@/lib/fetch"
import { getFirebaseAuthClient } from "@/lib/firebase/client"
import type { LoginPayload, LoginResponse, User } from "@/types/auth"

export const authKeys = {
  me: ["auth", "me"] as const,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => fetchApi<User>("/api/auth/me"),
    retry: false,
  })
}

const firebaseAuthErrorMessages: Record<string, string> = {
  "auth/invalid-credential": "Email atau kata sandi salah.",
  "auth/invalid-email": "Format email tidak valid.",
  "auth/user-not-found": "Email atau kata sandi salah.",
  "auth/wrong-password": "Email atau kata sandi salah.",
  "auth/user-disabled": "Akun Anda telah dinonaktifkan. Hubungi administrator.",
  "auth/too-many-requests": "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.",
  "auth/network-request-failed": "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
  "auth/weak-password": "Kata sandi terlalu lemah. Gunakan minimal 8 karakter.",
  "auth/requires-recent-login": "Sesi terlalu lama. Silakan logout dan login ulang.",
}

function mapFirebaseError(error: unknown): Error {
  if (error instanceof FirebaseError) {
    const message = firebaseAuthErrorMessages[error.code] ?? "Terjadi kesalahan."
    return new Error(message)
  }
  return error instanceof Error ? error : new Error("Terjadi kesalahan tidak terduga.")
}

async function loginFlow(payload: LoginPayload): Promise<LoginResponse> {
  const auth = getFirebaseAuthClient()
  let idToken: string
  try {
    const credential = await signInWithEmailAndPassword(auth, payload.email, payload.password)
    idToken = await credential.user.getIdToken()
  } catch (error) {
    throw mapFirebaseError(error)
  }

  return fetchApi<LoginResponse>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: loginFlow,
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, data.user)
    },
  })
}

async function logoutFlow(): Promise<{ success: boolean }> {
  const auth = getFirebaseAuthClient()
  await signOut(auth).catch(() => undefined)
  return fetchApi<{ success: boolean }>("/api/auth/logout", { method: "POST" })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logoutFlow,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null)
      queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

interface ChangePasswordVariables {
  currentPassword: string
  newPassword: string
}

async function changePasswordFlow({
  currentPassword,
  newPassword,
}: ChangePasswordVariables): Promise<{ success: boolean }> {
  const auth = getFirebaseAuthClient()
  const user = auth.currentUser
  if (!user || !user.email) {
    throw new Error("Sesi tidak ditemukan. Silakan login ulang.")
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "auth/invalid-credential") {
      throw new Error("Kata sandi saat ini salah.")
    }
    throw mapFirebaseError(error)
  }

  try {
    await updatePassword(user, newPassword)
  } catch (error) {
    throw mapFirebaseError(error)
  }

  return fetchApi<{ success: boolean }>("/api/auth/clear-must-change-password", {
    method: "POST",
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: changePasswordFlow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

async function forgotPasswordFlow(email: string): Promise<{ success: boolean }> {
  const auth = getFirebaseAuthClient()
  // Don't leak account existence — swallow errors and always report success.
  await sendPasswordResetEmail(auth, email).catch(() => undefined)
  return { success: true }
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPasswordFlow,
  })
}
