import "server-only"

import { expensesRepository } from "@/lib/repositories/expenses"
import { purchasesRepository } from "@/lib/repositories/purchases"
import { salariesRepository } from "@/lib/repositories/salaries"
import { salesRepository } from "@/lib/repositories/sales"
import type { PeriodSummary } from "@/types/reports"

function sumField<T>(items: T[], key: keyof T): number {
  return items.reduce((acc, item) => acc + (Number(item[key]) || 0), 0)
}

export async function getPeriodSummary({
  from,
  to,
}: {
  from: number
  to: number
}): Promise<PeriodSummary> {
  const [sales, purchases, salaries, expenses] = await Promise.all([
    salesRepository.findByDateRange(from, to),
    purchasesRepository.findByDateRange(from, to),
    salariesRepository.findByDateRange(from, to),
    expensesRepository.findByDateRange(from, to),
  ])

  const totalRevenue = sumField(sales, "total")
  const totalPurchases = sumField(purchases, "amount")
  const totalSalaries = sumField(salaries, "amount")
  const totalExpenses = sumField(expenses, "amount")
  const totalOutflow = totalPurchases + totalSalaries + totalExpenses
  const netProfit = totalRevenue - totalOutflow

  return {
    totalRevenue,
    totalPurchases,
    totalSalaries,
    totalExpenses,
    totalOutflow,
    netProfit,
    salesCount: sales.length,
    purchasesCount: purchases.length,
    salariesCount: salaries.length,
    expensesCount: expenses.length,
  }
}
