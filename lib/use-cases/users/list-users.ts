import "server-only"

import { usersRepository } from "@/lib/repositories/users"
import type { User } from "@/types/users"

export async function listUsers(): Promise<User[]> {
  return usersRepository.findAll({
    orderBy: { field: "createdAt", direction: "desc" },
  })
}
