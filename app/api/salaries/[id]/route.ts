import { ZodError } from "zod"

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

export async function GET(_request: Request, context: RouteContext) {
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
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await request.json()) as UpdateSalaryPayload
    const data = await updateSalary(id, body)
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
}

export async function DELETE(_request: Request, context: RouteContext) {
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
}
