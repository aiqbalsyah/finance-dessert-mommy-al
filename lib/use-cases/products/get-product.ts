import "server-only"

import { productsRepository } from "@/lib/repositories/products"
import type { Product } from "@/types/products"

export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Produk dengan ID ${id} tidak ditemukan.`)
    this.name = "ProductNotFoundError"
  }
}

export async function getProduct(id: string): Promise<Product> {
  const product = await productsRepository.findById(id)
  if (!product) throw new ProductNotFoundError(id)
  return product
}
