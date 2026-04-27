import { ZodError } from "zod"

import { createSalary, listSalaries } from "@/lib/use-cases/salaries"
import type { CreateSalaryPayload } from "@/types/salaries"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") ?? undefined
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    const from = fromParam ? Number(fromParam) : undefined
    const to = toParam ? Number(toParam) : undefined
    const data = await listSalaries({ period, from, to })
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat daftar pembayaran gaji." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateSalaryPayload
    const data = await createSalary(body)
    return Response.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : "Gagal mencatat pembayaran gaji."
    return Response.json({ error: message }, { status: 400 })
  }
}
