import { ZodError } from "zod"

import {
  PurchaseNotFoundError,
  deletePurchase,
  getPurchase,
  updatePurchase,
} from "@/lib/use-cases/purchases"
import type { UpdatePurchasePayload } from "@/types/purchases"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    const data = await getPurchase(id)
    return Response.json(data)
  } catch (error) {
    if (error instanceof PurchaseNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal memuat pembelian." }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await request.json()) as UpdatePurchasePayload
    const data = await updatePurchase(id, body)
    return Response.json(data)
  } catch (error) {
    if (error instanceof PurchaseNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    return Response.json({ error: "Gagal mengubah pembelian." }, { status: 400 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    await deletePurchase(id)
    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof PurchaseNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal menghapus pembelian." }, { status: 500 })
  }
}
