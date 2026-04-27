import * as z from "zod"

import type { BaseEntity } from "@/lib/repositories"

export type UnsoldReason = "expired" | "damaged" | "leftover" | "other"

export interface UnsoldItem extends BaseEntity {
  productId: string
  productName: string
  qty: number
  /** Date in YYYY-MM-DD format (day-only, no time component). */
  date: string
  reason?: UnsoldReason
  note?: string
}

const unsoldReasonSchema = z.enum(
  ["expired", "damaged", "leftover", "other"],
  { message: "Alasan tidak valid." }
)

export const unsoldItemCreateSchema = z.object({
  productId: z.string().min(1, "Produk wajib dipilih."),
  qty: z
    .number({ message: "Jumlah harus berupa angka." })
    .int("Jumlah harus berupa bilangan bulat.")
    .positive("Jumlah minimal 1."),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus dalam format YYYY-MM-DD."),
  reason: unsoldReasonSchema.or(z.undefined()),
  note: z.string().max(500, "Catatan maksimal 500 karakter."),
})

export const unsoldItemUpdateSchema = unsoldItemCreateSchema.partial()

export type CreateUnsoldItemPayload = z.infer<typeof unsoldItemCreateSchema>
export type UpdateUnsoldItemPayload = z.infer<typeof unsoldItemUpdateSchema>

export const unsoldReasonLabels: Record<UnsoldReason, string> = {
  expired: "Kadaluarsa",
  damaged: "Rusak",
  leftover: "Sisa",
  other: "Lainnya",
}
