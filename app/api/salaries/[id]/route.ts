import { ZodError } from "zod"

import { withAuth } from "@/lib/auth"
import {
  SalaryNotFoundError,
  deleteSalary,
  getSalary,
  updateSalary,
} from "@/lib/use-cases/salaries"
import type { UpdateSalaryPayload } from "@/types/salaries"

interface RouteContext {
  params: Promise<{ id: string }>
}

export const GET = withAuth<RouteContext>(async (_request, context) => {
  const { id } = await context.params
  try {
    const data = await getSalary(id)
    return Response.json(data)
  } catch (error) {
    if (error instanceof SalaryNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal memuat pembayaran gaji." }, { status: 500 })
  }
}, { permission: "salaries:read" })

export const PATCH = withAuth<RouteContext>(async (request, context, user) => {
  const { id } = await context.params
  try {
    const body = (await request.json()) as UpdateSalaryPayload
    const data = await updateSalary(id, body, { userId: user.id, userName: user.displayName })
    return Response.json(data)
  } catch (error) {
    if (error instanceof SalaryNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    return Response.json({ error: "Gagal mengubah pembayaran gaji." }, { status: 400 })
  }
}, { permission: "salaries:update" })

export const DELETE = withAuth<RouteContext>(async (_request, context) => {
  const { id } = await context.params
  try {
    await deleteSalary(id)
    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof SalaryNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal menghapus pembayaran gaji." }, { status: 500 })
  }
}, { permission: "salaries:delete" })
