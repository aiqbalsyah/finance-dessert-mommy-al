import "server-only"

import { salesRepository } from "@/lib/repositories/sales"
import type { Sale } from "@/types/sales"

export class SaleNotFoundError extends Error {
  constructor(id: string) {
    super(`Penjualan dengan ID ${id} tidak ditemukan.`)
    this.name = "SaleNotFoundError"
  }
}

export async function getSale(id: string): Promise<Sale> {
  const sale = await salesRepository.findById(id)
  if (!sale) throw new SaleNotFoundError(id)
  return sale
}
