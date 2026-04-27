import "server-only"

import { accountsRepository } from "@/lib/repositories/accounts"
import type { Account } from "@/types/accounts"

export class AccountNotFoundError extends Error {
  constructor(id: string) {
    super(`Rekening dengan ID ${id} tidak ditemukan.`)
    this.name = "AccountNotFoundError"
  }
}

export async function getAccount(id: string): Promise<Account> {
  const account = await accountsRepository.findById(id)
  if (!account) throw new AccountNotFoundError(id)
  return account
}
