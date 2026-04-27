import { ZodError } from "zod"

import {
  AccountInUseError,
  AccountNotFoundError,
  deleteAccount,
  getAccount,
  updateAccount,
} from "@/lib/use-cases/accounts"
import type { UpdateAccountPayload } from "@/types/accounts"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    const data = await getAccount(id)
    return Response.json(data)
  } catch (error) {
    if (error instanceof AccountNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal memuat rekening." }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await request.json()) as UpdateAccountPayload
    const data = await updateAccount(id, body)
    return Response.json(data)
  } catch (error) {
    if (error instanceof AccountNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    return Response.json({ error: "Gagal mengubah rekening." }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    await deleteAccount(id)
    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof AccountNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof AccountInUseError) {
      return Response.json({ error: error.message }, { status: 409 })
    }
    return Response.json({ error: "Gagal menghapus rekening." }, { status: 500 })
  }
}
