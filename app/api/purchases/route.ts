import { ZodError } from "zod"

import { withAuth } from "@/lib/auth"
import { createPurchase, listPurchases } from "@/lib/use-cases/purchases"
import type { CreatePurchasePayload } from "@/types/purchases"

export const GET = withAuth(async (request) => {
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
}, { permission: "purchases:read" })

export const POST = withAuth(async (request, _ctx, user) => {
  try {
    const body = (await request.json()) as CreatePurchasePayload
    const data = await createPurchase(body, { userId: user.id, userName: user.displayName })
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
}, { permission: "purchases:create" })
