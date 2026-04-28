import { ZodError } from "zod"

import { withAuth } from "@/lib/auth"
import {
  SaleNotFoundError,
  deleteSale,
  getSale,
  updateSale,
} from "@/lib/use-cases/sales"
import type { UpdateSalePayload } from "@/types/sales"

interface RouteContext {
  params: Promise<{ id: string }>
}

export const GET = withAuth<RouteContext>(async (_request, context) => {
  const { id } = await context.params
  try {
    const data = await getSale(id)
    return Response.json(data)
  } catch (error) {
    if (error instanceof SaleNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal memuat penjualan." }, { status: 500 })
  }
}, { permission: "sales:read" })

export const PATCH = withAuth<RouteContext>(async (request, context, user) => {
  const { id } = await context.params
  try {
    const body = (await request.json()) as UpdateSalePayload
    const data = await updateSale(id, body, { userId: user.id, userName: user.displayName })
    return Response.json(data)
  } catch (error) {
    if (error instanceof SaleNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : "Gagal mengubah penjualan."
    return Response.json({ error: message }, { status: 400 })
  }
}, { permission: "sales:update" })

export const DELETE = withAuth<RouteContext>(async (_request, context) => {
  const { id } = await context.params
  try {
    await deleteSale(id)
    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof SaleNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal menghapus penjualan." }, { status: 500 })
  }
}, { permission: "sales:delete" })
