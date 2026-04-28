import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchApi } from "@/lib/fetch"
import type { CreateUserPayload, UpdateUserPayload, User } from "@/types/users"

export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
}

export function useGetUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: () => fetchApi<User[]>("/api/users"),
  })
}

export function useGetUser(id: string | undefined) {
  return useQuery({
    queryKey: id ? userKeys.detail(id) : userKeys.detail("__none__"),
    queryFn: () => fetchApi<User>(`/api/users/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      fetchApi<User>("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      fetchApi<User>(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
      queryClient.setQueryData(userKeys.detail(data.id), data)
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ success: boolean }>(`/api/users/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ tempPassword: string }>(`/api/users/${id}/reset-password`, {
        method: "POST",
      }),
  })
}
