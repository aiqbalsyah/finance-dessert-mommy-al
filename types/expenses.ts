import * as z from "zod"

import type { BaseEntity } from "@/lib/repositories"

export type ExpenseCategory =
  | "utilities"
  | "rent"
  | "transport"
  | "supplies"
  | "marketing"
  | "other"

export interface Expense extends BaseEntity {
  category: ExpenseCategory
  description: string
  amount: number
  accountId: string
  spentAt: number
  receiptUrl?: string
  receiptPath?: string
  note?: string
}

const expenseCategorySchema = z.enum(
  ["utilities", "rent", "transport", "supplies", "marketing", "other"],
  { message: "Kategori pengeluaran tidak valid." }
)

export const expenseCreateSchema = z.object({
  category: expenseCategorySchema,
  description: z
    .string()
    .min(2, "Deskripsi minimal 2 karakter.")
    .max(120, "Deskripsi maksimal 120 karakter."),
  amount: z
    .number({ message: "Jumlah harus berupa angka." })
    .int("Jumlah harus berupa bilangan bulat.")
    .positive("Jumlah minimal 1."),
  accountId: z.string().min(1, "Rekening wajib dipilih."),
  spentAt: z
    .number({ message: "Tanggal pengeluaran wajib diisi." })
    .int()
    .positive(),
  receiptUrl: z.string().or(z.undefined()),
  receiptPath: z.string().or(z.undefined()),
  note: z.string().max(500, "Catatan maksimal 500 karakter."),
})

export const expenseUpdateSchema = expenseCreateSchema.partial()

export type CreateExpensePayload = z.infer<typeof expenseCreateSchema>
export type UpdateExpensePayload = z.infer<typeof expenseUpdateSchema>

export const expenseCategoryLabels: Record<ExpenseCategory, string> = {
  utilities: "Utilitas",
  rent: "Sewa",
  transport: "Transportasi",
  supplies: "Perlengkapan",
  marketing: "Pemasaran",
  other: "Lainnya",
}
