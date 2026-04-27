import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchApi } from "@/lib/fetch"
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from "@/types/products"

export const productKeys = {
  all: ["products"] as const,
  list: (filters?: { active?: boolean }) => [...productKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
}

interface UseGetProductsOptions {
  active?: boolean
}

export function useGetProducts(options: UseGetProductsOptions = {}) {
  return useQuery({
    queryKey: productKeys.list(options),
    queryFn: () => {
      const url = options.active === true ? "/api/products?active=true" : "/api/products"
      return fetchApi<Product[]>(url)
    },
  })
}

export function useGetProduct(id: string | undefined) {
  return useQuery({
    queryKey: id ? productKeys.detail(id) : productKeys.detail("__none__"),
    queryFn: () => fetchApi<Product>(`/api/products/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      fetchApi<Product>("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateProductPayload) =>
      fetchApi<Product>(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.setQueryData(productKeys.detail(data.id), data)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ success: boolean }>(`/api/products/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
