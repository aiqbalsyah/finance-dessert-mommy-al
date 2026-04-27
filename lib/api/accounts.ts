import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchApi } from "@/lib/fetch"
import type {
  Account,
  CreateAccountPayload,
  UpdateAccountPayload,
} from "@/types/accounts"

export const accountKeys = {
  all: ["accounts"] as const,
  list: () => [...accountKeys.all, "list"] as const,
  detail: (id: string) => [...accountKeys.all, "detail", id] as const,
}

export function useGetAccounts() {
  return useQuery({
    queryKey: accountKeys.list(),
    queryFn: () => fetchApi<Account[]>("/api/accounts"),
  })
}

export function useGetAccount(id: string | undefined) {
  return useQuery({
    queryKey: id ? accountKeys.detail(id) : accountKeys.detail("__none__"),
    queryFn: () => fetchApi<Account>(`/api/accounts/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) =>
      fetchApi<Account>("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.list() })
    },
  })
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateAccountPayload) =>
      fetchApi<Account>(`/api/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: accountKeys.list() })
      queryClient.setQueryData(accountKeys.detail(data.id), data)
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ success: boolean }>(`/api/accounts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.list() })
    },
  })
}
