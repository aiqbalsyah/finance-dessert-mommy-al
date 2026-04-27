import "server-only"

import { deleteFile } from "@/lib/firebase"
import { expensesRepository } from "@/lib/repositories/expenses"
import {
  expenseCreateSchema,
  expenseUpdateSchema,
  type CreateExpensePayload,
  type Expense,
  type ExpenseCategory,
  type UpdateExpensePayload,
} from "@/types/expenses"

export class ExpenseNotFoundError extends Error {
  constructor(id: string) {
    super(`Pengeluaran dengan ID ${id} tidak ditemukan.`)
    this.name = "ExpenseNotFoundError"
  }
}

function cleanOptional(value: string | undefined): string | undefined {
  return value?.trim() ? value.trim() : undefined
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  const parsed = expenseCreateSchema.parse(payload)
  return expensesRepository.create({
    category: parsed.category,
    description: parsed.description.trim(),
    amount: parsed.amount,
    accountId: parsed.accountId,
    spentAt: parsed.spentAt,
    receiptUrl: parsed.receiptUrl,
    receiptPath: parsed.receiptPath,
    note: cleanOptional(parsed.note),
  })
}

export interface ListExpensesOptions {
  category?: ExpenseCategory
  from?: number
  to?: number
}

export async function listExpenses(options: ListExpensesOptions = {}): Promise<Expense[]> {
  const { category, from, to } = options
  if (category && from !== undefined && to !== undefined) {
    return expensesRepository.findByCategory(category, { from, to })
  }
  if (category) return expensesRepository.findByCategory(category)
  if (from !== undefined && to !== undefined) {
    return expensesRepository.findByDateRange(from, to)
  }
  return expensesRepository.findAll({
    orderBy: { field: "spentAt", direction: "desc" },
  })
}

export async function getExpense(id: string): Promise<Expense> {
  const expense = await expensesRepository.findById(id)
  if (!expense) throw new ExpenseNotFoundError(id)
  return expense
}

export async function updateExpense(id: string, payload: UpdateExpensePayload): Promise<Expense> {
  const parsed = expenseUpdateSchema.parse(payload)
  const existing = await expensesRepository.findById(id)
  if (!existing) throw new ExpenseNotFoundError(id)

  const updates: Partial<Expense> = {}
  if (parsed.category !== undefined) updates.category = parsed.category
  if (parsed.description !== undefined) updates.description = parsed.description.trim()
  if (parsed.amount !== undefined) updates.amount = parsed.amount
  if (parsed.accountId !== undefined) updates.accountId = parsed.accountId
  if (parsed.spentAt !== undefined) updates.spentAt = parsed.spentAt
  if (parsed.receiptUrl !== undefined) updates.receiptUrl = parsed.receiptUrl
  if (parsed.receiptPath !== undefined) updates.receiptPath = parsed.receiptPath
  if (parsed.note !== undefined) updates.note = cleanOptional(parsed.note)

  return expensesRepository.update(id, updates)
}

export async function deleteExpense(id: string): Promise<void> {
  const existing = await expensesRepository.findById(id)
  if (!existing) throw new ExpenseNotFoundError(id)

  await expensesRepository.delete(id)

  if (existing.receiptPath) {
    await deleteFile(existing.receiptPath).catch(() => undefined)
  }
}
