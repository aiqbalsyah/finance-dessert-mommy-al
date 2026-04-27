import "server-only"

import { expensesRepository } from "@/lib/repositories/expenses"
import type { ExpenseCategory } from "@/types/expenses"
import type { ExpenseBreakdownItem } from "@/types/reports"

export async function getExpenseBreakdown({
  from,
  to,
}: {
  from: number
  to: number
}): Promise<ExpenseBreakdownItem[]> {
  const expenses = await expensesRepository.findByDateRange(from, to)

  const aggregated = new Map<ExpenseCategory, ExpenseBreakdownItem>()
  for (const expense of expenses) {
    const existing = aggregated.get(expense.category)
    if (existing) {
      existing.total += expense.amount
      existing.count += 1
    } else {
      aggregated.set(expense.category, {
        category: expense.category,
        total: expense.amount,
        count: 1,
      })
    }
  }

  return Array.from(aggregated.values()).sort((a, b) => b.total - a.total)
}
