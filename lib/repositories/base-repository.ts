import "server-only"

import {
  FieldValue,
  Timestamp,
  type CollectionReference,
  type DocumentData,
  type Query,
  type WhereFilterOp,
} from "firebase-admin/firestore"

import { getDb } from "@/lib/firebase"

export interface Actor {
  /** Firebase UID of the user performing the action. */
  userId: string
  /** Snapshot of the user's display name at action time. Preserved if user is later renamed/deleted. */
  userName: string
}

export interface BaseEntity {
  id: string
  createdAt: number
  updatedAt: number
  /** Snapshot of the user who created this document. Optional for backward compatibility with pre-audit-trail records. */
  createdBy?: Actor
  /** Snapshot of the user who last updated this document. */
  updatedBy?: Actor
}

export interface QueryFilter {
  field: string
  op: WhereFilterOp
  value: unknown
}

export interface QueryOptions {
  filters?: QueryFilter[]
  orderBy?: { field: string; direction?: "asc" | "desc" }
  limit?: number
}

function timestampToSeconds(value: unknown): number {
  if (value instanceof Timestamp) return value.seconds
  if (typeof value === "number") return value
  return 0
}

function mapDoc<T extends BaseEntity>(snapshot: FirebaseFirestore.DocumentSnapshot): T | null {
  if (!snapshot.exists) return null
  const data = snapshot.data() as DocumentData
  return {
    ...data,
    id: snapshot.id,
    createdAt: timestampToSeconds(data.createdAt),
    updatedAt: timestampToSeconds(data.updatedAt),
  } as T
}

export class BaseRepository<T extends BaseEntity> {
  constructor(private readonly collectionName: string) {}

  protected collection(): CollectionReference {
    return getDb().collection(this.collectionName)
  }

  async create(payload: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
    const ref = this.collection().doc()
    const now = FieldValue.serverTimestamp()
    await ref.set({ ...payload, createdAt: now, updatedAt: now })
    const snapshot = await ref.get()
    const result = mapDoc<T>(snapshot)
    if (!result) throw new Error(`Failed to create document in ${this.collectionName}`)
    return result
  }

  async findById(id: string): Promise<T | null> {
    const snapshot = await this.collection().doc(id).get()
    return mapDoc<T>(snapshot)
  }

  async findAll(options: QueryOptions = {}): Promise<T[]> {
    let query: Query = this.collection()

    if (options.filters) {
      for (const filter of options.filters) {
        query = query.where(filter.field, filter.op, filter.value)
      }
    }
    if (options.orderBy) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction ?? "desc")
    }
    if (options.limit) {
      query = query.limit(options.limit)
    }

    const snapshot = await query.get()
    return snapshot.docs.map((doc) => mapDoc<T>(doc)).filter((doc): doc is T => doc !== null)
  }

  async update(id: string, payload: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>): Promise<T> {
    const ref = this.collection().doc(id)
    await ref.update({ ...payload, updatedAt: FieldValue.serverTimestamp() })
    const snapshot = await ref.get()
    const result = mapDoc<T>(snapshot)
    if (!result) throw new Error(`Document ${id} not found in ${this.collectionName} after update`)
    return result
  }

  async delete(id: string): Promise<void> {
    await this.collection().doc(id).delete()
  }

  async count(filters: QueryFilter[] = []): Promise<number> {
    let query: Query = this.collection()
    for (const filter of filters) {
      query = query.where(filter.field, filter.op, filter.value)
    }
    const snapshot = await query.count().get()
    return snapshot.data().count
  }
}
