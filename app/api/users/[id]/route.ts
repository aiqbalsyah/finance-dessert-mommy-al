import { ZodError } from "zod"

import { withAuth } from "@/lib/auth"
import {
  CannotDeleteSelfError,
  LastAdminError,
  UserNotFoundError,
  deleteUser,
  getUser,
  updateUser,
} from "@/lib/use-cases/users"
import type { UpdateUserPayload } from "@/types/users"

interface RouteContext {
  params: Promise<{ id: string }>
}

export const GET = withAuth<RouteContext>(async (_request, context) => {
  const { id } = await context.params
  try {
    const data = await getUser(id)
    return Response.json(data)
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal memuat pengguna." }, { status: 500 })
  }
}, { permission: "users:manage" })

export const PATCH = withAuth<RouteContext>(async (request, context) => {
  const { id } = await context.params
  try {
    const body = (await request.json()) as UpdateUserPayload
    const data = await updateUser(id, body)
    return Response.json(data)
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof LastAdminError) {
      return Response.json({ error: error.message }, { status: 409 })
    }
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    return Response.json({ error: "Gagal mengubah pengguna." }, { status: 500 })
  }
}, { permission: "users:manage" })

export const DELETE = withAuth<RouteContext>(async (_request, context, currentUser) => {
  const { id } = await context.params
  try {
    await deleteUser(id, currentUser.id)
    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof CannotDeleteSelfError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    if (error instanceof LastAdminError) {
      return Response.json({ error: error.message }, { status: 409 })
    }
    return Response.json({ error: "Gagal menghapus pengguna." }, { status: 500 })
  }
}, { permission: "users:manage" })
