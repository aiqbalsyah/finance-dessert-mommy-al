import { ZodError } from "zod"

import { withAuth } from "@/lib/auth"
import { createAccount, listAccounts } from "@/lib/use-cases/accounts"
import type { CreateAccountPayload } from "@/types/accounts"

export const GET = withAuth(async () => {
  try {
    const data = await listAccounts()
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat daftar rekening." }, { status: 500 })
  }
}, { permission: "accounts:read" })

export const POST = withAuth(async (request) => {
  try {
    const body = (await request.json()) as CreateAccountPayload
    const data = await createAccount(body)
    return Response.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    return Response.json({ error: "Gagal membuat rekening." }, { status: 500 })
  }
}, { permission: "accounts:create" })
