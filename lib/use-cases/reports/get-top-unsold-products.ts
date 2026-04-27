import "server-only"

import { unsoldItemsRepository } from "@/lib/repositories/unsold-items"
import type { TopUnsoldProductItem } from "@/types/reports"

function unixToDateString(unixSec: number): string {
  const date = new Date(unixSec * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export async function getTopUnsoldProducts({
  from,
  to,
  limit = 5,
}: {
  from: number
  to: number
  limit?: number
}): Promise<TopUnsoldProductItem[]> {
  const items = await unsoldItemsRepository.findByDateRange(
    unixToDateString(from),
    unixToDateString(to)
  )

  const aggregated = new Map<string, TopUnsoldProductItem>()
  for (const item of items) {
    const existing = aggregated.get(item.productId)
    if (existing) {
      existing.totalUnsoldQty += item.qty
      existing.recordCount += 1
    } else {
      aggregated.set(item.productId, {
        productId: item.productId,
        productName: item.productName,
        totalUnsoldQty: item.qty,
        recordCount: 1,
      })
    }
  }

  return Array.from(aggregated.values())
    .sort((a, b) => b.totalUnsoldQty - a.totalUnsoldQty)
    .slice(0, limit)
}
