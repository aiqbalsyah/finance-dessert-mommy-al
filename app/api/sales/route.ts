import { ZodError } from "zod"

import { createSale, listSales } from "@/lib/use-cases/sales"
import type { CreateSalePayload } from "@/types/sales"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    const productId = searchParams.get("productId") ?? undefined

    const from = fromParam ? Number(fromParam) : undefined
    const to = toParam ? Number(toParam) : undefined

    const data = await listSales({ from, to, productId })
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat daftar penjualan." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateSalePayload
    const data = await createSale(body)
    return Response.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : "Gagal mencatat penjualan."
    return Response.json({ error: message }, { status: 400 })
  }
}
