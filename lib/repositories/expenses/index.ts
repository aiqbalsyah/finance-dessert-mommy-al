import "server-only"

import { BaseRepository, type QueryFilter } from "@/lib/repositories"
import type { Expense, ExpenseCategory } from "@/types/expenses"

class ExpensesRepository extends BaseRepository<Expense> {
  constructor() {
    super("expenses")
  }

  async findByDateRange(fromTs: number, toTs: number): Promise<Expense[]> {
    return this.findAll({
      filters: [
        { field: "spentAt", op: ">=", value: fromTs },
        { field: "spentAt", op: "<=", value: toTs },
      ],
      orderBy: { field: "spentAt", direction: "desc" },
    })
  }

  async findByCategory(
    category: ExpenseCategory,
    range?: { from: number; to: number }
  ): Promise<Expense[]> {
    const filters: QueryFilter[] = [{ field: "category", op: "==", value: category }]
    if (range) {
      filters.push({ field: "spentAt", op: ">=", value: range.from })
      filters.push({ field: "spentAt", op: "<=", value: range.to })
    }
    return this.findAll({
      filters,
      orderBy: { field: "spentAt", direction: "desc" },
    })
  }
}

export const expensesRepository = new ExpensesRepository()
