import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchApi } from "@/lib/fetch"
import type {
  CreateUnsoldItemPayload,
  UnsoldItem,
  UpdateUnsoldItemPayload,
} from "@/types/unsold-items"

export interface UnsoldItemsFilters {
  from?: string
  to?: string
  productId?: string
}

export const unsoldItemKeys = {
  all: ["unsold-items"] as const,
  list: (filters?: UnsoldItemsFilters) => [...unsoldItemKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...unsoldItemKeys.all, "detail", id] as const,
}

function buildUrl(filters?: UnsoldItemsFilters) {
  if (!filters) return "/api/unsold-items"
  const params = new URLSearchParams()
  if (filters.from) params.set("from", filters.from)
  if (filters.to) params.set("to", filters.to)
  if (filters.productId) params.set("productId", filters.productId)
  const qs = params.toString()
  return qs ? `/api/unsold-items?${qs}` : "/api/unsold-items"
}

export function useGetUnsoldItems(filters?: UnsoldItemsFilters) {
  return useQuery({
    queryKey: unsoldItemKeys.list(filters),
    queryFn: () => fetchApi<UnsoldItem[]>(buildUrl(filters)),
  })
}

export function useGetUnsoldItem(id: string | undefined) {
  return useQuery({
    queryKey: id ? unsoldItemKeys.detail(id) : unsoldItemKeys.detail("__none__"),
    queryFn: () => fetchApi<UnsoldItem>(`/api/unsold-items/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateUnsoldItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateUnsoldItemPayload) =>
      fetchApi<UnsoldItem>("/api/unsold-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: unsoldItemKeys.all }),
  })
}

export function useUpdateUnsoldItem(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateUnsoldItemPayload) =>
      fetchApi<UnsoldItem>(`/api/unsold-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: unsoldItemKeys.all })
      queryClient.setQueryData(unsoldItemKeys.detail(data.id), data)
    },
  })
}

export function useDeleteUnsoldItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ success: boolean }>(`/api/unsold-items/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: unsoldItemKeys.all }),
  })
}
