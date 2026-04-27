"use client"

import { Cell, Pie, PieChart } from "recharts"

import { ChartCard, type ChartConfig } from "@/components/shared/chart-card"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useGetExpenseBreakdown, type ReportPeriod } from "@/lib/api/reports"
import { formatCurrency } from "@/lib/formatters"
import { expenseCategoryLabels, type ExpenseCategory } from "@/types/expenses"

interface DashboardExpenseBreakdownProps {
  period: ReportPeriod
}

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--color-muted-foreground)",
]

const config = {
  total: { label: "Total" },
  utilities: { label: expenseCategoryLabels.utilities },
  rent: { label: expenseCategoryLabels.rent },
  transport: { label: expenseCategoryLabels.transport },
  supplies: { label: expenseCategoryLabels.supplies },
  marketing: { label: expenseCategoryLabels.marketing },
  other: { label: expenseCategoryLabels.other },
} satisfies ChartConfig

export function DashboardExpenseBreakdown({ period }: DashboardExpenseBreakdownProps) {
  const { data, isLoading } = useGetExpenseBreakdown(period)

  const items = data ?? []
  const isEmpty = !isLoading && items.length === 0

  if (isEmpty) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg font-semibold md:text-2xl">
            Pengeluaran per Kategori
          </h3>
          <p className="text-sm text-muted-foreground">
            Distribusi pengeluaran berdasarkan kategori pada periode terpilih.
          </p>
        </div>
        <div className="rounded-card border border-border p-6 text-center text-sm text-muted-foreground">
          Belum ada pengeluaran tercatat pada periode ini.
        </div>
      </div>
    )
  }

  const chartData = items.map((item, index) => ({
    name: expenseCategoryLabels[item.category as ExpenseCategory],
    value: item.total,
    fill: chartColors[index % chartColors.length],
  }))

  return (
    <ChartCard
      title="Pengeluaran per Kategori"
      description="Distribusi pengeluaran berdasarkan kategori pada periode terpilih."
      config={config}
      chartClassName="aspect-square h-chart"
    >
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
              hideLabel
            />
          }
        />
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartCard>
  )
}
