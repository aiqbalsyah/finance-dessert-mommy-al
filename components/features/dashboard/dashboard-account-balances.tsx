"use client"

import { StatusMetricCard } from "@/components/shared/status-metric-card"
import { useGetAccountBalances } from "@/lib/api/reports"
import { formatCurrency } from "@/lib/formatters"
import { accountTypeLabels } from "@/types/accounts"

export function DashboardAccountBalances() {
  const { data, isLoading } = useGetAccountBalances()

  if (isLoading) return null
  if (!data || data.length === 0) {
    return (
      <div className="rounded-card border border-border p-6 text-center text-sm text-muted-foreground">
        Belum ada rekening. Tambahkan rekening untuk melihat saldo di sini.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-lg font-semibold md:text-2xl">Saldo Rekening</h3>
        <p className="text-sm text-muted-foreground">
          Saldo terakhir per rekening yang tercatat.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <StatusMetricCard
            key={item.accountId}
            label={
              item.accountCode
                ? `${accountTypeLabels[item.accountType]} • ${item.accountCode}`
                : accountTypeLabels[item.accountType]
            }
            value={formatCurrency(item.balance)}
            subtitle={item.accountName}
          />
        ))}
      </div>
    </div>
  )
}
