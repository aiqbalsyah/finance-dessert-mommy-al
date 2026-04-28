"use client"

import { MetricCard } from "@/components/shared/metric-card"
import { useGetAccountBalances, useGetPeriodSummary, type ReportPeriod } from "@/lib/api/reports"
import { formatCurrency } from "@/lib/formatters"

interface DashboardMetricsProps {
  period: ReportPeriod
}

export function DashboardMetrics({ period }: DashboardMetricsProps) {
  const summaryQuery = useGetPeriodSummary(period)
  const balancesQuery = useGetAccountBalances()

  const summary = summaryQuery.data
  const totalBalance = (balancesQuery.data ?? []).reduce(
    (acc, item) => acc + item.balance,
    0
  )

  const placeholder = "—"

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Omzet"
        value={summary ? formatCurrency(summary.totalRevenue) : placeholder}
        icon="trending_up"
      />
      <MetricCard
        title="Pengeluaran"
        value={summary ? formatCurrency(summary.totalOutflow) : placeholder}
        icon="trending_down"
      />
      <MetricCard
        title="Laba Bersih"
        value={summary ? formatCurrency(summary.netProfit) : placeholder}
        icon="account_balance_wallet"
      />
      <MetricCard
        title="Saldo Total"
        value={balancesQuery.data ? formatCurrency(totalBalance) : placeholder}
        icon="savings"
      />
    </div>
  )
}
