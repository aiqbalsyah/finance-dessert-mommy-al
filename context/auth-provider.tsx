"use client"

import { createContext, useCallback, useContext, useMemo } from "react"

import { useCurrentUser } from "@/lib/api/auth"
import { can as canForRole, type Permission } from "@/lib/auth/permissions-matrix"
import type { User, UserRole } from "@/types/users"

interface AuthContextValue {
  user: User | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  /** Returns true if the current user has the given permission. False if not logged in. */
  can: (permission: Permission) => boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  can: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useCurrentUser()

  const resolvedUser = isError ? null : user ?? null
  const role = resolvedUser?.role ?? null

  const can = useCallback(
    (permission: Permission): boolean => {
      if (!role) return false
      return canForRole(role, permission)
    },
    [role]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: resolvedUser,
      role,
      isAuthenticated: !isError && !!resolvedUser,
      isLoading,
      can,
    }),
    [resolvedUser, role, isError, isLoading, can]
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  return useContext(AuthContext)
}
