import "server-only"

import type { Actor } from "@/lib/repositories"
import { accountsRepository } from "@/lib/repositories/accounts"
import { accountUpdateSchema, type Account, type UpdateAccountPayload } from "@/types/accounts"

import { AccountNotFoundError } from "./get-account"

export async function updateAccount(
  id: string,
  payload: UpdateAccountPayload,
  actor: Actor
): Promise<Account> {
  const parsed = accountUpdateSchema.parse(payload)
  const existing = await accountsRepository.findById(id)
  if (!existing) throw new AccountNotFoundError(id)

  const updates: Partial<Account> = { updatedBy: actor }
  if (parsed.name !== undefined) updates.name = parsed.name
  if (parsed.type !== undefined) updates.type = parsed.type
  if (parsed.code !== undefined) updates.code = parsed.code?.trim() ? parsed.code.trim() : undefined
  if (parsed.balance !== undefined) updates.balance = parsed.balance

  return accountsRepository.update(id, updates)
}
