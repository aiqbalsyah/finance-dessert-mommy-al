import "server-only"

import { deleteFile } from "@/lib/firebase"
import { salesRepository } from "@/lib/repositories/sales"

import { SaleNotFoundError } from "./get-sale"

export async function deleteSale(id: string): Promise<void> {
  const existing = await salesRepository.findById(id)
  if (!existing) throw new SaleNotFoundError(id)

  await salesRepository.delete(id)

  if (existing.receiptPath) {
    // Best-effort cleanup; do not fail the operation if storage delete errors.
    await deleteFile(existing.receiptPath).catch(() => undefined)
  }
}
