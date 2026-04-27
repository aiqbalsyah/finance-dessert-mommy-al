import "server-only"

import { deleteFile } from "@/lib/firebase"
import { salariesRepository } from "@/lib/repositories/salaries"
import {
  salaryCreateSchema,
  salaryUpdateSchema,
  type CreateSalaryPayload,
  type Salary,
  type UpdateSalaryPayload,
} from "@/types/salaries"

export class SalaryNotFoundError extends Error {
  constructor(id: string) {
    super(`Pembayaran gaji dengan ID ${id} tidak ditemukan.`)
    this.name = "SalaryNotFoundError"
  }
}

function cleanOptional(value: string | undefined): string | undefined {
  return value?.trim() ? value.trim() : undefined
}

export async function createSalary(payload: CreateSalaryPayload): Promise<Salary> {
  const parsed = salaryCreateSchema.parse(payload)
  return salariesRepository.create({
    employeeName: parsed.employeeName.trim(),
    amount: parsed.amount,
    accountId: parsed.accountId,
    paidAt: parsed.paidAt,
    period: parsed.period,
    receiptUrl: parsed.receiptUrl,
    receiptPath: parsed.receiptPath,
    note: cleanOptional(parsed.note),
  })
}

export interface ListSalariesOptions {
  period?: string
  from?: number
  to?: number
}

export async function listSalaries(options: ListSalariesOptions = {}): Promise<Salary[]> {
  if (options.period) return salariesRepository.findByPeriod(options.period)
  if (options.from !== undefined && options.to !== undefined) {
    return salariesRepository.findByDateRange(options.from, options.to)
  }
  return salariesRepository.findAll({
    orderBy: { field: "paidAt", direction: "desc" },
  })
}

export async function getSalary(id: string): Promise<Salary> {
  const salary = await salariesRepository.findById(id)
  if (!salary) throw new SalaryNotFoundError(id)
  return salary
}

export async function updateSalary(id: string, payload: UpdateSalaryPayload): Promise<Salary> {
  const parsed = salaryUpdateSchema.parse(payload)
  const existing = await salariesRepository.findById(id)
  if (!existing) throw new SalaryNotFoundError(id)

  const updates: Partial<Salary> = {}
  if (parsed.employeeName !== undefined) updates.employeeName = parsed.employeeName.trim()
  if (parsed.amount !== undefined) updates.amount = parsed.amount
  if (parsed.accountId !== undefined) updates.accountId = parsed.accountId
  if (parsed.paidAt !== undefined) updates.paidAt = parsed.paidAt
  if (parsed.period !== undefined) updates.period = parsed.period
  if (parsed.receiptUrl !== undefined) updates.receiptUrl = parsed.receiptUrl
  if (parsed.receiptPath !== undefined) updates.receiptPath = parsed.receiptPath
  if (parsed.note !== undefined) updates.note = cleanOptional(parsed.note)

  return salariesRepository.update(id, updates)
}

export async function deleteSalary(id: string): Promise<void> {
  const existing = await salariesRepository.findById(id)
  if (!existing) throw new SalaryNotFoundError(id)

  await salariesRepository.delete(id)

  if (existing.receiptPath) {
    await deleteFile(existing.receiptPath).catch(() => undefined)
  }
}
