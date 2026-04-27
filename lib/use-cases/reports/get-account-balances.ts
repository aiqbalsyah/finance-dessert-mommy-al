import "server-only"

import { accountsRepository } from "@/lib/repositories/accounts"
import { expensesRepository } from "@/lib/repositories/expenses"
import { purchasesRepository } from "@/lib/repositories/purchases"
import { salariesRepository } from "@/lib/repositories/salaries"
import { salesRepository } from "@/lib/repositories/sales"
import type { AccountBalanceItem } from "@/types/reports"

async function countAccountReferences(accountId: string): Promise<number> {
  const filter = { field: "accountId", op: "==" as const, value: accountId }
  const [s, p, g, e] = await Promise.all([
    salesRepository.count([filter]),
    purchasesRepository.count([filter]),
    salariesRepository.count([filter]),
    expensesRepository.count([filter]),
  ])
  return s + p + g + e
}

export async function getAccountBalances(): Promise<AccountBalanceItem[]> {
  const accounts = await accountsRepository.findAll({
    orderBy: { field: "name", direction: "asc" },
  })

  const counts = await Promise.all(accounts.map((a) => countAccountReferences(a.id)))

  return accounts.map((account, index) => ({
    accountId: account.id,
    accountName: account.name,
    accountType: account.type,
    accountCode: account.code,
    balance: account.balance,
    transactionCount: counts[index] ?? 0,
  }))
}
