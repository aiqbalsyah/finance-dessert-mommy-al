import { ZodError } from "zod"

import { withAuth } from "@/lib/auth"
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

export const GET = withAuth<RouteContext>(async (_request, context) => {
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
}, { permission: "unsold-items:read" })

export const PATCH = withAuth<RouteContext>(async (request, context, user) => {
  const { id } = await context.params
  try {
    const body = (await request.json()) as UpdateUnsoldItemPayload
    const data = await updateUnsoldItem(id, body, { userId: user.id, userName: user.displayName })
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
}, { permission: "unsold-items:update" })

export const DELETE = withAuth<RouteContext>(async (_request, context) => {
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
}, { permission: "unsold-items:delete" })
