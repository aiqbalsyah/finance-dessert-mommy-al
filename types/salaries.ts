import * as z from "zod"

import type { BaseEntity } from "@/lib/repositories"

export interface Salary extends BaseEntity {
  employeeName: string
  amount: number
  accountId: string
  paidAt: number
  /** Period in YYYY-MM format (e.g. "2026-04"). */
  period: string
  receiptUrl?: string
  receiptPath?: string
  note?: string
}

export const salaryCreateSchema = z.object({
  employeeName: z
    .string()
    .min(2, "Nama karyawan minimal 2 karakter.")
    .max(80, "Nama karyawan maksimal 80 karakter."),
  amount: z
    .number({ message: "Jumlah harus berupa angka." })
    .int("Jumlah harus berupa bilangan bulat.")
    .positive("Jumlah minimal 1."),
  accountId: z.string().min(1, "Rekening wajib dipilih."),
  paidAt: z
    .number({ message: "Tanggal pembayaran wajib diisi." })
    .int()
    .positive(),
  period: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Periode harus dalam format YYYY-MM."),
  receiptUrl: z.string().or(z.undefined()),
  receiptPath: z.string().or(z.undefined()),
  note: z.string().max(500, "Catatan maksimal 500 karakter."),
})

export const salaryUpdateSchema = salaryCreateSchema.partial()

export type CreateSalaryPayload = z.infer<typeof salaryCreateSchema>
export type UpdateSalaryPayload = z.infer<typeof salaryUpdateSchema>
