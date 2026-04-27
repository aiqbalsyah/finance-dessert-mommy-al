import "server-only"

import { salesRepository } from "@/lib/repositories/sales"
import type { Sale } from "@/types/sales"

export interface ListSalesOptions {
  from?: number
  to?: number
  productId?: string
}

export async function listSales(options: ListSalesOptions = {}): Promise<Sale[]> {
  const { from, to, productId } = options

  if (productId && from !== undefined && to !== undefined) {
    return salesRepository.findByProduct(productId, { from, to })
  }
  if (productId) {
    return salesRepository.findByProduct(productId)
  }
  if (from !== undefined && to !== undefined) {
    return salesRepository.findByDateRange(from, to)
  }

  return salesRepository.findAll({
    orderBy: { field: "soldAt", direction: "desc" },
  })
}
