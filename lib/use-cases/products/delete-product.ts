import "server-only"

import { productsRepository } from "@/lib/repositories/products"

import { ProductNotFoundError } from "./get-product"

// TODO Phase 04+: guard against deletion if any sales/unsold_items reference this product.
export async function deleteProduct(id: string): Promise<void> {
  const existing = await productsRepository.findById(id)
  if (!existing) throw new ProductNotFoundError(id)
  await productsRepository.delete(id)
}
