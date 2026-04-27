import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchApi } from "@/lib/fetch"
import type {
  CreateSalaryPayload,
  Salary,
  UpdateSalaryPayload,
} from "@/types/salaries"

export interface SalariesFilters {
  period?: string
  from?: number
  to?: number
}

export const salaryKeys = {
  all: ["salaries"] as const,
  list: (filters?: SalariesFilters) => [...salaryKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...salaryKeys.all, "detail", id] as const,
}

function buildUrl(filters?: SalariesFilters) {
  if (!filters) return "/api/salaries"
  const params = new URLSearchParams()
  if (filters.period) params.set("period", filters.period)
  if (filters.from !== undefined) params.set("from", String(filters.from))
  if (filters.to !== undefined) params.set("to", String(filters.to))
  const qs = params.toString()
  return qs ? `/api/salaries?${qs}` : "/api/salaries"
}

export function useGetSalaries(filters?: SalariesFilters) {
  return useQuery({
    queryKey: salaryKeys.list(filters),
    queryFn: () => fetchApi<Salary[]>(buildUrl(filters)),
  })
}

export function useGetSalary(id: string | undefined) {
  return useQuery({
    queryKey: id ? salaryKeys.detail(id) : salaryKeys.detail("__none__"),
    queryFn: () => fetchApi<Salary>(`/api/salaries/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateSalary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSalaryPayload) =>
      fetchApi<Salary>("/api/salaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: salaryKeys.all }),
  })
}

export function useUpdateSalary(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSalaryPayload) =>
      fetchApi<Salary>(`/api/salaries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: salaryKeys.all })
      queryClient.setQueryData(salaryKeys.detail(data.id), data)
    },
  })
}

export function useDeleteSalary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ success: boolean }>(`/api/salaries/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: salaryKeys.all }),
  })
}
