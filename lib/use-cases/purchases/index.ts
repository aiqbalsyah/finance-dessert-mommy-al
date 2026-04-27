import "server-only"

import { ZodError } from "zod"

import { deleteFile } from "@/lib/firebase"
import { purchasesRepository } from "@/lib/repositories/purchases"
import {
  purchaseCreateSchema,
  purchaseUpdateSchema,
  type CreatePurchasePayload,
  type Purchase,
  type UpdatePurchasePayload,
} from "@/types/purchases"

export class PurchaseNotFoundError extends Error {
  constructor(id: string) {
    super(`Pembelian dengan ID ${id} tidak ditemukan.`)
    this.name = "PurchaseNotFoundError"
  }
}

function cleanOptional(value: string | undefined): string | undefined {
  return value?.trim() ? value.trim() : undefined
}

export async function createPurchase(payload: CreatePurchasePayload): Promise<Purchase> {
  const parsed = purchaseCreateSchema.parse(payload)
  return purchasesRepository.create({
    description: parsed.description.trim(),
    amount: parsed.amount,
    accountId: parsed.accountId,
    purchasedAt: parsed.purchasedAt,
    vendor: cleanOptional(parsed.vendor),
    receiptUrl: parsed.receiptUrl,
    receiptPath: parsed.receiptPath,
    note: cleanOptional(parsed.note),
  })
}

export interface ListPurchasesOptions {
  from?: number
  to?: number
}

export async function listPurchases(options: ListPurchasesOptions = {}): Promise<Purchase[]> {
  if (options.from !== undefined && options.to !== undefined) {
    return purchasesRepository.findByDateRange(options.from, options.to)
  }
  return purchasesRepository.findAll({
    orderBy: { field: "purchasedAt", direction: "desc" },
  })
}

export async function getPurchase(id: string): Promise<Purchase> {
  const purchase = await purchasesRepository.findById(id)
  if (!purchase) throw new PurchaseNotFoundError(id)
  return purchase
}

export async function updatePurchase(id: string, payload: UpdatePurchasePayload): Promise<Purchase> {
  const parsed = purchaseUpdateSchema.parse(payload)
  const existing = await purchasesRepository.findById(id)
  if (!existing) throw new PurchaseNotFoundError(id)

  const updates: Partial<Purchase> = {}
  if (parsed.description !== undefined) updates.description = parsed.description.trim()
  if (parsed.amount !== undefined) updates.amount = parsed.amount
  if (parsed.accountId !== undefined) updates.accountId = parsed.accountId
  if (parsed.purchasedAt !== undefined) updates.purchasedAt = parsed.purchasedAt
  if (parsed.vendor !== undefined) updates.vendor = cleanOptional(parsed.vendor)
  if (parsed.receiptUrl !== undefined) updates.receiptUrl = parsed.receiptUrl
  if (parsed.receiptPath !== undefined) updates.receiptPath = parsed.receiptPath
  if (parsed.note !== undefined) updates.note = cleanOptional(parsed.note)

  return purchasesRepository.update(id, updates)
}

export async function deletePurchase(id: string): Promise<void> {
  const existing = await purchasesRepository.findById(id)
  if (!existing) throw new PurchaseNotFoundError(id)

  await purchasesRepository.delete(id)

  if (existing.receiptPath) {
    await deleteFile(existing.receiptPath).catch(() => undefined)
  }
}

// Re-export ZodError for use in API routes (avoids needing direct zod import there).
export { ZodError }
