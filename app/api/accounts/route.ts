import { ZodError } from "zod"

import { createAccount, listAccounts } from "@/lib/use-cases/accounts"
import type { CreateAccountPayload } from "@/types/accounts"

export async function GET() {
  try {
    const data = await listAccounts()
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat daftar rekening." }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
}
