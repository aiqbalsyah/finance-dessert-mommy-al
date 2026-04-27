import { ZodError } from "zod"

import {
  UnsoldItemNotFoundError,
  deleteUnsoldItem,
  getUnsoldItem,
  updateUnsoldItem,
} from "@/lib/use-cases/unsold-items"
import type { UpdateUnsoldItemPayload } from "@/types/unsold-items"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    const data = await getUnsoldItem(id)
    return Response.json(data)
  } catch (error) {
    if (error instanceof UnsoldItemNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal memuat catatan." }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await request.json()) as UpdateUnsoldItemPayload
    const data = await updateUnsoldItem(id, body)
    return Response.json(data)
  } catch (error) {
    if (error instanceof UnsoldItemNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : "Gagal mengubah catatan."
    return Response.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    await deleteUnsoldItem(id)
    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof UnsoldItemNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal menghapus catatan." }, { status: 500 })
  }
}
