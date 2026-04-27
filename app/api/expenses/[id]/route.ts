import { ZodError } from "zod"

import {
  ExpenseNotFoundError,
  deleteExpense,
  getExpense,
  updateExpense,
} from "@/lib/use-cases/expenses"
import type { UpdateExpensePayload } from "@/types/expenses"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    const data = await getExpense(id)
    return Response.json(data)
  } catch (error) {
    if (error instanceof ExpenseNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal memuat pengeluaran." }, { status: 500 })
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    const body = (await request.json()) as UpdateExpensePayload
    const data = await updateExpense(id, body)
    return Response.json(data)
  } catch (error) {
    if (error instanceof ExpenseNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    return Response.json({ error: "Gagal mengubah pengeluaran." }, { status: 400 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params
  try {
    await deleteExpense(id)
    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof ExpenseNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal menghapus pengeluaran." }, { status: 500 })
  }
}
