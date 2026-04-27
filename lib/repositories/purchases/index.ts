import "server-only"

import { BaseRepository } from "@/lib/repositories"
import type { Purchase } from "@/types/purchases"

class PurchasesRepository extends BaseRepository<Purchase> {
  constructor() {
    super("purchases")
  }

  async findByDateRange(fromTs: number, toTs: number): Promise<Purchase[]> {
    return this.findAll({
      filters: [
        { field: "purchasedAt", op: ">=", value: fromTs },
        { field: "purchasedAt", op: "<=", value: toTs },
      ],
      orderBy: { field: "purchasedAt", direction: "desc" },
    })
  }
}

export const purchasesRepository = new PurchasesRepository()
