"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetExpenseBreakdown, type ReportPeriod } from "@/lib/api/reports"
import { formatCurrency } from "@/lib/formatters"
import { expenseCategoryLabels } from "@/types/expenses"

interface LaporanExpenseBreakdownProps {
  period: ReportPeriod
}

export function LaporanExpenseBreakdown({ period }: LaporanExpenseBreakdownProps) {
  const { data, isLoading } = useGetExpenseBreakdown(period)

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Memuat...</p>
  }
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Belum ada pengeluaran tercatat pada periode ini.
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((acc, item) => acc + item.total, 0)

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Pengeluaran per Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y divide-border">
          {data.map((item) => {
            const pct = total > 0 ? (item.total / total) * 100 : 0
            return (
              <div key={item.category} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">
                    {expenseCategoryLabels[item.category]}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(item.total)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pct.toFixed(1)}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.count}× transaksi
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
