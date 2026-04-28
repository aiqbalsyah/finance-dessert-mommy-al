import { withAuth } from "@/lib/auth"
import { usersRepository } from "@/lib/repositories/users"

export const POST = withAuth(async (_request, _ctx, user) => {
  try {
    await usersRepository.update(user.id, { mustChangePassword: false })
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Gagal memperbarui status kata sandi." }, { status: 500 })
  }
}, { allowAny: true })
