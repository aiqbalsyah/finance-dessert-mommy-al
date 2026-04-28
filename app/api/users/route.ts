import { ZodError } from "zod"

import { withAuth } from "@/lib/auth"
import { UserAlreadyExistsError, createUser, listUsers } from "@/lib/use-cases/users"
import type { CreateUserPayload } from "@/types/users"

export const GET = withAuth(async () => {
  try {
    const data = await listUsers()
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat daftar pengguna." }, { status: 500 })
  }
}, { permission: "users:manage" })

export const POST = withAuth(async (request) => {
  try {
    const body = (await request.json()) as CreateUserPayload
    const data = await createUser(body)
    return Response.json(data, { status: 201 })
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return Response.json({ error: error.message }, { status: 409 })
    }
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Data tidak valid." },
        { status: 400 }
      )
    }
    return Response.json({ error: "Gagal membuat pengguna." }, { status: 500 })
  }
}, { permission: "users:manage" })
