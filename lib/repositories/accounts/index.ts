import "server-only"

import { BaseRepository } from "@/lib/repositories"
import type { Account } from "@/types/accounts"

class AccountsRepository extends BaseRepository<Account> {
  constructor() {
    super("accounts")
  }

  async findByCode(code: string): Promise<Account | null> {
    const results = await this.findAll({
      filters: [{ field: "code", op: "==", value: code }],
      limit: 1,
    })
    return results[0] ?? null
  }
}

export const accountsRepository = new AccountsRepository()
