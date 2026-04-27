import { ZodError } from "zod"

import { createUnsoldItem, listUnsoldItems } from "@/lib/use-cases/unsold-items"
import type { CreateUnsoldItemPayload } from "@/types/unsold-items"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from") ?? undefined
    const to = searchParams.get("to") ?? undefined
    const productId = searchParams.get("productId") ?? undefined
    const data = await listUnsoldItems({ from, to, productId })
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat daftar barang tidak terjual." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateUnsoldItemPayload
    const data = await createUnsoldItem(body)
    return Response.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    const message = error instanceof Error ? error.message : "Gagal mencatat barang tidak terjual."
    return Response.json({ error: message }, { status: 400 })
  }
}
