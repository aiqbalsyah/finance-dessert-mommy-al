import * as z from "zod"

import type { BaseEntity } from "@/lib/repositories"

export interface Purchase extends BaseEntity {
  description: string
  amount: number
  accountId: string
  purchasedAt: number
  vendor?: string
  receiptUrl?: string
  receiptPath?: string
  note?: string
}

export const purchaseCreateSchema = z.object({
  description: z
    .string()
    .min(2, "Deskripsi minimal 2 karakter.")
    .max(120, "Deskripsi maksimal 120 karakter."),
  amount: z
    .number({ message: "Jumlah harus berupa angka." })
    .int("Jumlah harus berupa bilangan bulat.")
    .positive("Jumlah minimal 1."),
  accountId: z.string().min(1, "Rekening wajib dipilih."),
  purchasedAt: z
    .number({ message: "Tanggal pembelian wajib diisi." })
    .int()
    .positive(),
  vendor: z.string().max(80, "Nama vendor maksimal 80 karakter."),
  receiptUrl: z.string().or(z.undefined()),
  receiptPath: z.string().or(z.undefined()),
  note: z.string().max(500, "Catatan maksimal 500 karakter."),
})

export const purchaseUpdateSchema = purchaseCreateSchema.partial()

export type CreatePurchasePayload = z.infer<typeof purchaseCreateSchema>
export type UpdatePurchasePayload = z.infer<typeof purchaseUpdateSchema>
