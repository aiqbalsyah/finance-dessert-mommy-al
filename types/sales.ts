import * as z from "zod"

import type { BaseEntity } from "@/lib/repositories"

export interface Sale extends BaseEntity {
  productId: string
  productName: string
  qty: number
  unitPrice: number
  total: number
  accountId: string
  soldAt: number
  receiptUrl?: string
  receiptPath?: string
  note?: string
}

export const saleCreateSchema = z.object({
  productId: z.string().min(1, "Produk wajib dipilih."),
  qty: z
    .number({ message: "Qty harus berupa angka." })
    .int("Qty harus berupa bilangan bulat.")
    .positive("Qty minimal 1."),
  unitPrice: z
    .number({ message: "Harga satuan harus berupa angka." })
    .int("Harga satuan harus berupa bilangan bulat.")
    .nonnegative("Harga satuan tidak boleh negatif."),
  accountId: z.string().min(1, "Rekening wajib dipilih."),
  soldAt: z
    .number({ message: "Tanggal penjualan wajib diisi." })
    .int()
    .positive(),
  receiptUrl: z.string().or(z.undefined()),
  receiptPath: z.string().or(z.undefined()),
  note: z.string().max(500, "Catatan maksimal 500 karakter."),
})

export const saleUpdateSchema = saleCreateSchema.partial()

export type CreateSalePayload = z.infer<typeof saleCreateSchema>
export type UpdateSalePayload = z.infer<typeof saleUpdateSchema>
