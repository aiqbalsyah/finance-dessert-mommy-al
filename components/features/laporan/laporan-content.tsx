"use client"

import { useMemo, useState } from "react"

import { DashboardHeader } from "@/components/layouts/dashboard/dashboard-header"
import { PageHeader } from "@/components/layouts/dashboard/page-header"
import {
  formatPeriodRange,
  getPeriodRange,
  type PeriodPreset,
} from "@/components/shared/period-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { LaporanExpenseBreakdown } from "./laporan-expense-breakdown"
import { LaporanPeriodPicker } from "./laporan-period-picker"
import { LaporanPl } from "./laporan-pl"
import { LaporanTopProducts } from "./laporan-top-products"
import { LaporanTopUnsold } from "./laporan-top-unsold"

export function LaporanContent() {
  const [preset, setPreset] = useState<PeriodPreset>("this-month")
  const range = useMemo(() => getPeriodRange(preset), [preset])

  return (
    <>
      <DashboardHeader title="Laporan" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <PageHeader
          title="Laporan"
          description={`Analisis keuangan • ${formatPeriodRange(range)}`}
          showBack={false}
          action={<LaporanPeriodPicker value={preset} onChange={setPreset} />}
        />

        <Tabs defaultValue="pl" className="flex flex-col gap-4">
          <TabsList className="self-start">
            <TabsTrigger value="pl">Laba Rugi</TabsTrigger>
            <TabsTrigger value="expenses">Pengeluaran</TabsTrigger>
            <TabsTrigger value="top-products">Produk Terlaris</TabsTrigger>
            <TabsTrigger value="top-unsold">Produk Tidak Terjual</TabsTrigger>
          </TabsList>

          <TabsContent value="pl">
            <LaporanPl period={range} />
          </TabsContent>
          <TabsContent value="expenses">
            <LaporanExpenseBreakdown period={range} />
          </TabsContent>
          <TabsContent value="top-products">
            <LaporanTopProducts period={range} />
          </TabsContent>
          <TabsContent value="top-unsold">
            <LaporanTopUnsold period={range} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
