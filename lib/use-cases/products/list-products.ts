import "server-only"

import { productsRepository } from "@/lib/repositories/products"
import type { Product } from "@/types/products"

export interface ListProductsOptions {
  active?: boolean
}

export async function listProducts(options: ListProductsOptions = {}): Promise<Product[]> {
  if (options.active === true) {
    return productsRepository.findActive()
  }
  return productsRepository.findAll({
    orderBy: { field: "name", direction: "asc" },
  })
}
