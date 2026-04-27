"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetPeriodSummary, type ReportPeriod } from "@/lib/api/reports"
import { formatCurrency } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface LaporanPlProps {
  period: ReportPeriod
}

export function LaporanPl({ period }: LaporanPlProps) {
  const { data, isLoading } = useGetPeriodSummary(period)

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Memuat ringkasan...</p>
  }
  if (!data) {
    return <p className="text-sm text-muted-foreground">Belum ada data pada periode ini.</p>
  }

  const rows = [
    { label: "Pendapatan (Penjualan)", value: data.totalRevenue, kind: "income" as const },
    { label: "Pembelian Bahan", value: data.totalPurchases, kind: "expense" as const },
    { label: "Gaji Karyawan", value: data.totalSalaries, kind: "expense" as const },
    { label: "Pengeluaran Lain-lain", value: data.totalExpenses, kind: "expense" as const },
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Ringkasan Laba Rugi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y divide-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 py-3 first:pt-0"
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  row.kind === "expense" && "text-destructive"
                )}
              >
                {row.kind === "expense" ? "−" : ""}
                {formatCurrency(row.value)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 pt-3">
            <span className="text-sm font-semibold">Total Pengeluaran</span>
            <span className="text-sm font-semibold tabular-nums">
              {formatCurrency(data.totalOutflow)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 pt-3">
            <span className="text-base font-semibold">Laba Bersih</span>
            <span
              className={cn(
                "text-base font-semibold tabular-nums",
                data.netProfit >= 0 ? "text-success-900" : "text-destructive"
              )}
            >
              {formatCurrency(data.netProfit)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
