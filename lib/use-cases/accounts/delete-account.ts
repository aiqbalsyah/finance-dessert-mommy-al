import "server-only"

import { accountsRepository } from "@/lib/repositories/accounts"
import { expensesRepository } from "@/lib/repositories/expenses"
import { purchasesRepository } from "@/lib/repositories/purchases"
import { salariesRepository } from "@/lib/repositories/salaries"
import { salesRepository } from "@/lib/repositories/sales"

import { AccountNotFoundError } from "./get-account"

export class AccountInUseError extends Error {
  constructor() {
    super("Rekening tidak dapat dihapus karena masih memiliki transaksi terkait.")
    this.name = "AccountInUseError"
  }
}

async function countAccountReferences(accountId: string): Promise<number> {
  const filter = { field: "accountId", op: "==" as const, value: accountId }
  const [salesCount, purchasesCount, salariesCount, expensesCount] = await Promise.all([
    salesRepository.count([filter]),
    purchasesRepository.count([filter]),
    salariesRepository.count([filter]),
    expensesRepository.count([filter]),
  ])
  return salesCount + purchasesCount + salariesCount + expensesCount
}

export async function deleteAccount(id: string): Promise<void> {
  const existing = await accountsRepository.findById(id)
  if (!existing) throw new AccountNotFoundError(id)

  const referenceCount = await countAccountReferences(id)
  if (referenceCount > 0) throw new AccountInUseError()

  await accountsRepository.delete(id)
}
