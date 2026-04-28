import { ZodError } from "zod"

import { withAuth } from "@/lib/auth"
import { createProduct, listProducts } from "@/lib/use-cases/products"
import type { CreateProductPayload } from "@/types/products"

export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get("active") === "true" ? true : undefined
    const data = await listProducts({ active })
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat daftar produk." }, { status: 500 })
  }
}, { permission: "products:read" })

export const POST = withAuth(async (request, _ctx, user) => {
  try {
    const body = (await request.json()) as CreateProductPayload
    const data = await createProduct(body, { userId: user.id, userName: user.displayName })
    return Response.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    return Response.json({ error: "Gagal membuat produk." }, { status: 500 })
  }
}, { permission: "products:create" })
