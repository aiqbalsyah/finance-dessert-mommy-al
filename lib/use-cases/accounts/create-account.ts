import "server-only"

import { accountsRepository } from "@/lib/repositories/accounts"
import { accountCreateSchema, type Account, type CreateAccountPayload } from "@/types/accounts"

export async function createAccount(payload: CreateAccountPayload): Promise<Account> {
  const parsed = accountCreateSchema.parse(payload)
  return accountsRepository.create({
    name: parsed.name,
    type: parsed.type,
    code: parsed.code?.trim() ? parsed.code.trim() : undefined,
    balance: parsed.balance,
  })
}
