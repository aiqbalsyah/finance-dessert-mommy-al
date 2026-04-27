import "server-only"

import { salesRepository } from "@/lib/repositories/sales"
import type { TopProductItem } from "@/types/reports"

export async function getTopProducts({
  from,
  to,
  limit = 5,
}: {
  from: number
  to: number
  limit?: number
}): Promise<TopProductItem[]> {
  const sales = await salesRepository.findByDateRange(from, to)

  const aggregated = new Map<string, TopProductItem>()
  for (const sale of sales) {
    const existing = aggregated.get(sale.productId)
    if (existing) {
      existing.totalQty += sale.qty
      existing.totalRevenue += sale.total
      existing.salesCount += 1
    } else {
      aggregated.set(sale.productId, {
        productId: sale.productId,
        productName: sale.productName,
        totalQty: sale.qty,
        totalRevenue: sale.total,
        salesCount: 1,
      })
    }
  }

  return Array.from(aggregated.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit)
}
