import "server-only"

import type { Actor } from "@/lib/repositories"
import { productsRepository } from "@/lib/repositories/products"
import { productCreateSchema, type CreateProductPayload, type Product } from "@/types/products"

export async function createProduct(payload: CreateProductPayload, actor: Actor): Promise<Product> {
  const parsed = productCreateSchema.parse(payload)
  return productsRepository.create({ ...parsed, createdBy: actor, updatedBy: actor })
}
