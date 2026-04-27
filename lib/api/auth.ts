import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchApi } from "@/lib/fetch"
import type { User, LoginPayload, LoginResponse } from "@/types/auth"

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

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      fetchApi<LoginResponse>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      fetchApi<{ success: boolean }>("/api/auth/logout", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null)
      queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}
