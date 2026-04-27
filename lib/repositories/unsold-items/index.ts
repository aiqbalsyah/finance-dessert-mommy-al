import "server-only"

import { BaseRepository, type QueryFilter } from "@/lib/repositories"
import type { UnsoldItem } from "@/types/unsold-items"

class UnsoldItemsRepository extends BaseRepository<UnsoldItem> {
  constructor() {
    super("unsold_items")
  }

  async findByDateRange(fromDate: string, toDate: string): Promise<UnsoldItem[]> {
    return this.findAll({
      filters: [
        { field: "date", op: ">=", value: fromDate },
        { field: "date", op: "<=", value: toDate },
      ],
      orderBy: { field: "date", direction: "desc" },
    })
  }

  async findByProduct(
    productId: string,
    range?: { from: string; to: string }
  ): Promise<UnsoldItem[]> {
    const filters: QueryFilter[] = [{ field: "productId", op: "==", value: productId }]
    if (range) {
      filters.push({ field: "date", op: ">=", value: range.from })
      filters.push({ field: "date", op: "<=", value: range.to })
    }
    return this.findAll({
      filters,
      orderBy: { field: "date", direction: "desc" },
    })
  }
}

export const unsoldItemsRepository = new UnsoldItemsRepository()
