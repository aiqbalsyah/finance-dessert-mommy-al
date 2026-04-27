import * as z from "zod"

import type { BaseEntity } from "@/lib/repositories"

export type ProductCategory = "cake" | "cookie" | "pastry" | "drink" | "other"

export interface Product extends BaseEntity {
  name: string
  category: ProductCategory
  price: number
  isActive: boolean
}

const productCategorySchema = z.enum(
  ["cake", "cookie", "pastry", "drink", "other"],
  { message: "Kategori produk tidak valid." }
)

export const productCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Nama produk minimal 2 karakter.")
    .max(80, "Nama produk maksimal 80 karakter."),
  category: productCategorySchema,
  price: z
    .number({ message: "Harga harus berupa angka." })
    .int("Harga harus berupa bilangan bulat (tanpa desimal).")
    .nonnegative("Harga tidak boleh negatif."),
  isActive: z.boolean(),
})

export const productUpdateSchema = productCreateSchema.partial()

export type CreateProductPayload = z.infer<typeof productCreateSchema>
export type UpdateProductPayload = z.infer<typeof productUpdateSchema>

export const productCategoryLabels: Record<ProductCategory, string> = {
  cake: "Kue",
  cookie: "Kue Kering",
  pastry: "Pastry",
  drink: "Minuman",
  other: "Lainnya",
}
