"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetTopUnsoldProducts, type ReportPeriod } from "@/lib/api/reports"

interface LaporanTopUnsoldProps {
  period: ReportPeriod
}

export function LaporanTopUnsold({ period }: LaporanTopUnsoldProps) {
  const { data, isLoading } = useGetTopUnsoldProducts(period, 10)

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Memuat...</p>
  }
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Belum ada catatan barang tidak terjual pada periode ini.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">10 Produk Tidak Terjual Terbanyak</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col divide-y divide-border">
          {data.map((item, index) => (
            <li
              key={item.productId}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{item.productName}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.recordCount}× tercatat
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {item.totalUnsoldQty} pcs
              </span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
