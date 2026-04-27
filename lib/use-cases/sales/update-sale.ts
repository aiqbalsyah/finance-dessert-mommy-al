import "server-only"

import { productsRepository } from "@/lib/repositories/products"
import { salesRepository } from "@/lib/repositories/sales"
import { saleUpdateSchema, type Sale, type UpdateSalePayload } from "@/types/sales"

import { SaleNotFoundError } from "./get-sale"

export async function updateSale(id: string, payload: UpdateSalePayload): Promise<Sale> {
  const parsed = saleUpdateSchema.parse(payload)
  const existing = await salesRepository.findById(id)
  if (!existing) throw new SaleNotFoundError(id)

  const updates: Partial<Sale> = {}

  if (parsed.productId !== undefined && parsed.productId !== existing.productId) {
    const product = await productsRepository.findById(parsed.productId)
    if (!product) throw new Error("Produk yang dipilih tidak ditemukan.")
    updates.productId = parsed.productId
    updates.productName = product.name
  }
  if (parsed.qty !== undefined) updates.qty = parsed.qty
  if (parsed.unitPrice !== undefined) updates.unitPrice = parsed.unitPrice
  if (parsed.accountId !== undefined) updates.accountId = parsed.accountId
  if (parsed.soldAt !== undefined) updates.soldAt = parsed.soldAt
  if (parsed.receiptUrl !== undefined) updates.receiptUrl = parsed.receiptUrl
  if (parsed.receiptPath !== undefined) updates.receiptPath = parsed.receiptPath
  if (parsed.note !== undefined) {
    updates.note = parsed.note.trim() ? parsed.note.trim() : undefined
  }

  // Recompute total if qty or unitPrice changed.
  const newQty = updates.qty ?? existing.qty
  const newUnitPrice = updates.unitPrice ?? existing.unitPrice
  if (updates.qty !== undefined || updates.unitPrice !== undefined) {
    updates.total = newQty * newUnitPrice
  }

  return salesRepository.update(id, updates)
}
