import "server-only"

import { accountsRepository } from "@/lib/repositories/accounts"
import type { Account } from "@/types/accounts"

export async function listAccounts(): Promise<Account[]> {
  return accountsRepository.findAll({
    orderBy: { field: "name", direction: "asc" },
  })
}
