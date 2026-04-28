import "server-only"

import { FieldValue } from "firebase-admin/firestore"

import { BaseRepository } from "@/lib/repositories"
import type { User } from "@/types/users"

class UsersRepository extends BaseRepository<User> {
  constructor() {
    super("users")
  }

  /**
   * Create a user document with a specific ID (the Firebase Auth UID).
   * Differs from BaseRepository.create() which auto-generates the ID.
   */
  async createWithId(
    id: string,
    payload: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const ref = this.collection().doc(id)
    const now = FieldValue.serverTimestamp()
    await ref.set({ ...payload, createdAt: now, updatedAt: now })
    const created = await this.findById(id)
    if (!created) {
      throw new Error(`Failed to create user document for ID ${id}`)
    }
    return created
  }

  async findByEmail(email: string): Promise<User | null> {
    const results = await this.findAll({
      filters: [{ field: "email", op: "==", value: email }],
      limit: 1,
    })
    return results[0] ?? null
  }

  async countAdmins(): Promise<number> {
    return this.count([
      { field: "role", op: "==", value: "admin" },
      { field: "status", op: "==", value: "active" },
    ])
  }
}

export const usersRepository = new UsersRepository()
