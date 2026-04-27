"use client"

import { createContext, useContext } from "react"
import { useCurrentUser } from "@/lib/api/auth"
import type { User } from "@/types/auth"

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useCurrentUser()

  const value: AuthContextValue = {
    user: isError ? null : user ?? null,
    isAuthenticated: !isError && !!user,
    isLoading,
  }

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  return useContext(AuthContext)
}
