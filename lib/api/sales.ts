import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchApi } from "@/lib/fetch"
import type { CreateSalePayload, Sale, UpdateSalePayload } from "@/types/sales"

export interface SalesFilters {
  from?: number
  to?: number
  productId?: string
}

export const saleKeys = {
  all: ["sales"] as const,
  list: (filters?: SalesFilters) => [...saleKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...saleKeys.all, "detail", id] as const,
}

function buildSalesUrl(filters?: SalesFilters) {
  if (!filters) return "/api/sales"
  const params = new URLSearchParams()
  if (filters.from !== undefined) params.set("from", String(filters.from))
  if (filters.to !== undefined) params.set("to", String(filters.to))
  if (filters.productId) params.set("productId", filters.productId)
  const qs = params.toString()
  return qs ? `/api/sales?${qs}` : "/api/sales"
}

export function useGetSales(filters?: SalesFilters) {
  return useQuery({
    queryKey: saleKeys.list(filters),
    queryFn: () => fetchApi<Sale[]>(buildSalesUrl(filters)),
  })
}

export function useGetSale(id: string | undefined) {
  return useQuery({
    queryKey: id ? saleKeys.detail(id) : saleKeys.detail("__none__"),
    queryFn: () => fetchApi<Sale>(`/api/sales/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSalePayload) =>
      fetchApi<Sale>("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
    },
  })
}

export function useUpdateSale(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSalePayload) =>
      fetchApi<Sale>(`/api/sales/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
      queryClient.setQueryData(saleKeys.detail(data.id), data)
    },
  })
}

export function useDeleteSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ success: boolean }>(`/api/sales/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
    },
  })
}
