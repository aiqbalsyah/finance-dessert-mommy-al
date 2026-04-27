"use client"

import { DashboardHeader } from "@/components/layouts/dashboard/dashboard-header"
import { PageHeader } from "@/components/layouts/dashboard/page-header"
import { PeriodPicker, formatPeriodRange } from "@/components/shared/period-picker"

import { DashboardAccountBalances } from "./dashboard-account-balances"
import { DashboardExpenseBreakdown } from "./dashboard-expense-breakdown"
import { DashboardMetrics } from "./dashboard-metrics"
import { DashboardTopProducts } from "./dashboard-top-products"
import { DashboardTopUnsold } from "./dashboard-top-unsold"
import { useDashboardPeriod } from "./use-dashboard-period"

export function DashboardContent() {
  const { preset, setPreset, range } = useDashboardPeriod("this-month")

  return (
    <>
      <DashboardHeader title="Dashboard" />
      <div className="flex flex-col gap-6 p-4 md:gap-8 md:p-6">
        <PageHeader
          title="Dashboard"
          description={`Ringkasan keuangan • ${formatPeriodRange(range)}`}
          showBack={false}
          action={<PeriodPicker value={preset} onChange={setPreset} className="w-40" />}
        />

        <DashboardMetrics period={range} />
        <DashboardAccountBalances />

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardTopProducts period={range} />
          <DashboardTopUnsold period={range} />
        </div>

        <DashboardExpenseBreakdown period={range} />
      </div>
    </>
  )
}
