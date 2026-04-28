import { ZodError } from "zod"

import { withAuth } from "@/lib/auth"
import { createExpense, listExpenses } from "@/lib/use-cases/expenses"
import type { CreateExpensePayload, ExpenseCategory } from "@/types/expenses"

export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const category = (searchParams.get("category") as ExpenseCategory | null) ?? undefined
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    const from = fromParam ? Number(fromParam) : undefined
    const to = toParam ? Number(toParam) : undefined
    const data = await listExpenses({ category, from, to })
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat daftar pengeluaran." }, { status: 500 })
  }
}, { permission: "expenses:read" })

export const POST = withAuth(async (request, _ctx, user) => {
  try {
    const body = (await request.json()) as CreateExpensePayload
    const data = await createExpense(body, { userId: user.id, userName: user.displayName })
    return Response.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : "Gagal mencatat pengeluaran."
    return Response.json({ error: message }, { status: 400 })
  }
}, { permission: "expenses:create" })
