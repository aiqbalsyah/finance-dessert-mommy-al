import "server-only"

import type { Actor } from "@/lib/repositories"
import { productsRepository } from "@/lib/repositories/products"
import { productUpdateSchema, type Product, type UpdateProductPayload } from "@/types/products"

import { ProductNotFoundError } from "./get-product"

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload,
  actor: Actor
): Promise<Product> {
  const parsed = productUpdateSchema.parse(payload)
  const existing = await productsRepository.findById(id)
  if (!existing) throw new ProductNotFoundError(id)

  const updates: Partial<Product> = { updatedBy: actor }
  if (parsed.name !== undefined) updates.name = parsed.name
  if (parsed.category !== undefined) updates.category = parsed.category
  if (parsed.price !== undefined) updates.price = parsed.price
  if (parsed.isActive !== undefined) updates.isActive = parsed.isActive

  return productsRepository.update(id, updates)
}
