import "server-only"

import { productsRepository } from "@/lib/repositories/products"
import { unsoldItemsRepository } from "@/lib/repositories/unsold-items"
import {
  unsoldItemCreateSchema,
  unsoldItemUpdateSchema,
  type CreateUnsoldItemPayload,
  type UnsoldItem,
  type UpdateUnsoldItemPayload,
} from "@/types/unsold-items"

export class UnsoldItemNotFoundError extends Error {
  constructor(id: string) {
    super(`Catatan barang tidak terjual dengan ID ${id} tidak ditemukan.`)
    this.name = "UnsoldItemNotFoundError"
  }
}

function cleanOptional(value: string | undefined): string | undefined {
  return value?.trim() ? value.trim() : undefined
}

export async function createUnsoldItem(payload: CreateUnsoldItemPayload): Promise<UnsoldItem> {
  const parsed = unsoldItemCreateSchema.parse(payload)
  const product = await productsRepository.findById(parsed.productId)
  if (!product) throw new Error("Produk yang dipilih tidak ditemukan.")

  return unsoldItemsRepository.create({
    productId: parsed.productId,
    productName: product.name,
    qty: parsed.qty,
    date: parsed.date,
    reason: parsed.reason,
    note: cleanOptional(parsed.note),
  })
}

export interface ListUnsoldItemsOptions {
  from?: string
  to?: string
  productId?: string
}

export async function listUnsoldItems(options: ListUnsoldItemsOptions = {}): Promise<UnsoldItem[]> {
  const { from, to, productId } = options
  if (productId && from && to) {
    return unsoldItemsRepository.findByProduct(productId, { from, to })
  }
  if (productId) return unsoldItemsRepository.findByProduct(productId)
  if (from && to) return unsoldItemsRepository.findByDateRange(from, to)

  return unsoldItemsRepository.findAll({
    orderBy: { field: "date", direction: "desc" },
  })
}

export async function getUnsoldItem(id: string): Promise<UnsoldItem> {
  const item = await unsoldItemsRepository.findById(id)
  if (!item) throw new UnsoldItemNotFoundError(id)
  return item
}

export async function updateUnsoldItem(id: string, payload: UpdateUnsoldItemPayload): Promise<UnsoldItem> {
  const parsed = unsoldItemUpdateSchema.parse(payload)
  const existing = await unsoldItemsRepository.findById(id)
  if (!existing) throw new UnsoldItemNotFoundError(id)

  const updates: Partial<UnsoldItem> = {}

  if (parsed.productId !== undefined && parsed.productId !== existing.productId) {
    const product = await productsRepository.findById(parsed.productId)
    if (!product) throw new Error("Produk yang dipilih tidak ditemukan.")
    updates.productId = parsed.productId
    updates.productName = product.name
  }
  if (parsed.qty !== undefined) updates.qty = parsed.qty
  if (parsed.date !== undefined) updates.date = parsed.date
  if (parsed.reason !== undefined) updates.reason = parsed.reason
  if (parsed.note !== undefined) updates.note = cleanOptional(parsed.note)

  return unsoldItemsRepository.update(id, updates)
}

export async function deleteUnsoldItem(id: string): Promise<void> {
  const existing = await unsoldItemsRepository.findById(id)
  if (!existing) throw new UnsoldItemNotFoundError(id)
  await unsoldItemsRepository.delete(id)
}
