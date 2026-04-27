import { useQuery } from "@tanstack/react-query"

import { fetchApi } from "@/lib/fetch"
import type {
  AccountBalanceItem,
  ExpenseBreakdownItem,
  PeriodSummary,
  TopProductItem,
  TopUnsoldProductItem,
} from "@/types/reports"

export interface ReportPeriod {
  from: number
  to: number
}

export const reportKeys = {
  all: ["reports"] as const,
  periodSummary: (period: ReportPeriod) =>
    [...reportKeys.all, "period-summary", period] as const,
  accountBalances: () => [...reportKeys.all, "account-balances"] as const,
  topProducts: (period: ReportPeriod, limit?: number) =>
    [...reportKeys.all, "top-products", period, limit ?? null] as const,
  topUnsoldProducts: (period: ReportPeriod, limit?: number) =>
    [...reportKeys.all, "top-unsold-products", period, limit ?? null] as const,
  expenseBreakdown: (period: ReportPeriod) =>
    [...reportKeys.all, "expense-breakdown", period] as const,
}

function periodQuery(period: ReportPeriod): string {
  return `from=${period.from}&to=${period.to}`
}

export function useGetPeriodSummary(period: ReportPeriod) {
  return useQuery({
    queryKey: reportKeys.periodSummary(period),
    queryFn: () => fetchApi<PeriodSummary>(`/api/reports/period-summary?${periodQuery(period)}`),
  })
}

export function useGetAccountBalances() {
  return useQuery({
    queryKey: reportKeys.accountBalances(),
    queryFn: () => fetchApi<AccountBalanceItem[]>("/api/reports/account-balances"),
  })
}

export function useGetTopProducts(period: ReportPeriod, limit = 5) {
  return useQuery({
    queryKey: reportKeys.topProducts(period, limit),
    queryFn: () =>
      fetchApi<TopProductItem[]>(`/api/reports/top-products?${periodQuery(period)}&limit=${limit}`),
  })
}

export function useGetTopUnsoldProducts(period: ReportPeriod, limit = 5) {
  return useQuery({
    queryKey: reportKeys.topUnsoldProducts(period, limit),
    queryFn: () =>
      fetchApi<TopUnsoldProductItem[]>(
        `/api/reports/top-unsold-products?${periodQuery(period)}&limit=${limit}`
      ),
  })
}

export function useGetExpenseBreakdown(period: ReportPeriod) {
  return useQuery({
    queryKey: reportKeys.expenseBreakdown(period),
    queryFn: () =>
      fetchApi<ExpenseBreakdownItem[]>(`/api/reports/expense-breakdown?${periodQuery(period)}`),
  })
}
