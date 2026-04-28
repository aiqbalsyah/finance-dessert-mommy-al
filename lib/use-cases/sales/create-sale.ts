import "server-only"

import type { Actor } from "@/lib/repositories"
import { productsRepository } from "@/lib/repositories/products"
import { salesRepository } from "@/lib/repositories/sales"
import { saleCreateSchema, type CreateSalePayload, type Sale } from "@/types/sales"

export async function createSale(payload: CreateSalePayload, actor: Actor): Promise<Sale> {
  const parsed = saleCreateSchema.parse(payload)

  const product = await productsRepository.findById(parsed.productId)
  if (!product) {
    throw new Error("Produk yang dipilih tidak ditemukan.")
  }

  const total = parsed.qty * parsed.unitPrice

  return salesRepository.create({
    productId: parsed.productId,
    productName: product.name,
    qty: parsed.qty,
    unitPrice: parsed.unitPrice,
    total,
    accountId: parsed.accountId,
    soldAt: parsed.soldAt,
    receiptUrl: parsed.receiptUrl,
    receiptPath: parsed.receiptPath,
    note: parsed.note?.trim() ? parsed.note.trim() : undefined,
    createdBy: actor,
    updatedBy: actor,
  })
}
