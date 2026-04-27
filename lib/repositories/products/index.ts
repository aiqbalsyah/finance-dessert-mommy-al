import "server-only"

import { BaseRepository } from "@/lib/repositories"
import type { Product } from "@/types/products"

class ProductsRepository extends BaseRepository<Product> {
  constructor() {
    super("products")
  }

  async findActive(): Promise<Product[]> {
    return this.findAll({
      filters: [{ field: "isActive", op: "==", value: true }],
      orderBy: { field: "name", direction: "asc" },
    })
  }
}

export const productsRepository = new ProductsRepository()
