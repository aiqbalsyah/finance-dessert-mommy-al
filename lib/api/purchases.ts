import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchApi } from "@/lib/fetch"
import type {
  CreatePurchasePayload,
  Purchase,
  UpdatePurchasePayload,
} from "@/types/purchases"

export interface PurchasesFilters {
  from?: number
  to?: number
}

export const purchaseKeys = {
  all: ["purchases"] as const,
  list: (filters?: PurchasesFilters) => [...purchaseKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...purchaseKeys.all, "detail", id] as const,
}

function buildUrl(filters?: PurchasesFilters) {
  if (!filters) return "/api/purchases"
  const params = new URLSearchParams()
  if (filters.from !== undefined) params.set("from", String(filters.from))
  if (filters.to !== undefined) params.set("to", String(filters.to))
  const qs = params.toString()
  return qs ? `/api/purchases?${qs}` : "/api/purchases"
}

export function useGetPurchases(filters?: PurchasesFilters) {
  return useQuery({
    queryKey: purchaseKeys.list(filters),
    queryFn: () => fetchApi<Purchase[]>(buildUrl(filters)),
  })
}

export function useGetPurchase(id: string | undefined) {
  return useQuery({
    queryKey: id ? purchaseKeys.detail(id) : purchaseKeys.detail("__none__"),
    queryFn: () => fetchApi<Purchase>(`/api/purchases/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePurchasePayload) =>
      fetchApi<Purchase>("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: purchaseKeys.all }),
  })
}

export function useUpdatePurchase(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePurchasePayload) =>
      fetchApi<Purchase>(`/api/purchases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: purchaseKeys.all })
      queryClient.setQueryData(purchaseKeys.detail(data.id), data)
    },
  })
}

export function useDeletePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ success: boolean }>(`/api/purchases/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: purchaseKeys.all }),
  })
}
