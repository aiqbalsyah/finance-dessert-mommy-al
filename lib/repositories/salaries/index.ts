import "server-only"

import { BaseRepository } from "@/lib/repositories"
import type { Salary } from "@/types/salaries"

class SalariesRepository extends BaseRepository<Salary> {
  constructor() {
    super("salaries")
  }

  async findByPeriod(period: string): Promise<Salary[]> {
    return this.findAll({
      filters: [{ field: "period", op: "==", value: period }],
      orderBy: { field: "paidAt", direction: "desc" },
    })
  }

  async findByDateRange(fromTs: number, toTs: number): Promise<Salary[]> {
    return this.findAll({
      filters: [
        { field: "paidAt", op: ">=", value: fromTs },
        { field: "paidAt", op: "<=", value: toTs },
      ],
      orderBy: { field: "paidAt", direction: "desc" },
    })
  }
}

export const salariesRepository = new SalariesRepository()
