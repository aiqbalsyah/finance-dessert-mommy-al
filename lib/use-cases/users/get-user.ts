import "server-only"

import { usersRepository } from "@/lib/repositories/users"
import type { User } from "@/types/users"

import { UserNotFoundError } from "./errors"

export async function getUser(id: string): Promise<User> {
  const user = await usersRepository.findById(id)
  if (!user) throw new UserNotFoundError(id)
  return user
}
