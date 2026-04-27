import "server-only"

import { BaseRepository, type QueryFilter } from "@/lib/repositories"
import type { Sale } from "@/types/sales"

class SalesRepository extends BaseRepository<Sale> {
  constructor() {
    super("sales")
  }

  async findByDateRange(fromTs: number, toTs: number): Promise<Sale[]> {
    return this.findAll({
      filters: [
        { field: "soldAt", op: ">=", value: fromTs },
        { field: "soldAt", op: "<=", value: toTs },
      ],
      orderBy: { field: "soldAt", direction: "desc" },
    })
  }

  async findByProduct(
    productId: string,
    range?: { from: number; to: number }
  ): Promise<Sale[]> {
    const filters: QueryFilter[] = [{ field: "productId", op: "==", value: productId }]
    if (range) {
      filters.push({ field: "soldAt", op: ">=", value: range.from })
      filters.push({ field: "soldAt", op: "<=", value: range.to })
    }
    return this.findAll({
      filters,
      orderBy: { field: "soldAt", direction: "desc" },
    })
  }
}

export const salesRepository = new SalesRepository()
