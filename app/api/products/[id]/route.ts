import { ZodError } from "zod"

import { withAuth } from "@/lib/auth"
import {
  ProductNotFoundError,
  deleteProduct,
  getProduct,
  updateProduct,
} from "@/lib/use-cases/products"
import type { UpdateProductPayload } from "@/types/products"

interface RouteContext {
  params: Promise<{ id: string }>
}

export const GET = withAuth<RouteContext>(async (_request, context) => {
  const { id } = await context.params
  try {
    const data = await getProduct(id)
    return Response.json(data)
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal memuat produk." }, { status: 500 })
  }
}, { permission: "products:read" })

export const PATCH = withAuth<RouteContext>(async (request, context, user) => {
  const { id } = await context.params
  try {
    const body = (await request.json()) as UpdateProductPayload
    const data = await updateProduct(id, body, { userId: user.id, userName: user.displayName })
    return Response.json(data)
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    return Response.json({ error: "Gagal mengubah produk." }, { status: 500 })
  }
}, { permission: "products:update" })

export const DELETE = withAuth<RouteContext>(async (_request, context) => {
  const { id } = await context.params
  try {
    await deleteProduct(id)
    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal menghapus produk." }, { status: 500 })
  }
}, { permission: "products:delete" })
