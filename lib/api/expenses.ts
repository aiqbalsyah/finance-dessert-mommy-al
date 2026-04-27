import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchApi } from "@/lib/fetch"
import type {
  CreateExpensePayload,
  Expense,
  ExpenseCategory,
  UpdateExpensePayload,
} from "@/types/expenses"

export interface ExpensesFilters {
  category?: ExpenseCategory
  from?: number
  to?: number
}

export const expenseKeys = {
  all: ["expenses"] as const,
  list: (filters?: ExpensesFilters) => [...expenseKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...expenseKeys.all, "detail", id] as const,
}

function buildUrl(filters?: ExpensesFilters) {
  if (!filters) return "/api/expenses"
  const params = new URLSearchParams()
  if (filters.category) params.set("category", filters.category)
  if (filters.from !== undefined) params.set("from", String(filters.from))
  if (filters.to !== undefined) params.set("to", String(filters.to))
  const qs = params.toString()
  return qs ? `/api/expenses?${qs}` : "/api/expenses"
}

export function useGetExpenses(filters?: ExpensesFilters) {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => fetchApi<Expense[]>(buildUrl(filters)),
  })
}

export function useGetExpense(id: string | undefined) {
  return useQuery({
    queryKey: id ? expenseKeys.detail(id) : expenseKeys.detail("__none__"),
    queryFn: () => fetchApi<Expense>(`/api/expenses/${id}`),
    enabled: Boolean(id),
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) =>
      fetchApi<Expense>("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
  })
}

export function useUpdateExpense(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateExpensePayload) =>
      fetchApi<Expense>(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all })
      queryClient.setQueryData(expenseKeys.detail(data.id), data)
    },
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<{ success: boolean }>(`/api/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
  })
}
