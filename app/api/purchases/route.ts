import { ZodError } from "zod"

import { createPurchase, listPurchases } from "@/lib/use-cases/purchases"
import type { CreatePurchasePayload } from "@/types/purchases"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    const from = fromParam ? Number(fromParam) : undefined
    const to = toParam ? Number(toParam) : undefined
    const data = await listPurchases({ from, to })
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat daftar pembelian." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePurchasePayload
    const data = await createPurchase(body)
    return Response.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : "Gagal mencatat pembelian."
    return Response.json({ error: message }, { status: 400 })
  }
}
