import * as z from "zod"

import type { BaseEntity } from "@/lib/repositories"

export type AccountType = "bank" | "cash"

export interface Account extends BaseEntity {
  name: string
  type: AccountType
  code?: string
  balance: number
}

const accountTypeSchema = z.enum(["bank", "cash"], {
  message: "Tipe rekening tidak valid.",
})

export const accountCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Nama rekening minimal 2 karakter.")
    .max(60, "Nama rekening maksimal 60 karakter."),
  type: accountTypeSchema,
  code: z
    .string()
    .max(10, "Kode rekening maksimal 10 karakter."),
  balance: z
    .number({ message: "Saldo harus berupa angka." })
    .int("Saldo harus berupa bilangan bulat (tanpa desimal).")
    .nonnegative("Saldo tidak boleh negatif."),
})

export const accountUpdateSchema = accountCreateSchema.partial()

export type CreateAccountPayload = z.infer<typeof accountCreateSchema>
export type UpdateAccountPayload = z.infer<typeof accountUpdateSchema>

export const accountTypeLabels: Record<AccountType, string> = {
  bank: "Bank",
  cash: "Cash",
}
