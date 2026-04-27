import "server-only"

import { productsRepository } from "@/lib/repositories/products"
import { productCreateSchema, type CreateProductPayload, type Product } from "@/types/products"

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const parsed = productCreateSchema.parse(payload)
  return productsRepository.create(parsed)
}
