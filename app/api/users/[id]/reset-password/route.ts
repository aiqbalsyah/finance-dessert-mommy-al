import { withAuth } from "@/lib/auth"
import { UserNotFoundError, resetUserPassword } from "@/lib/use-cases/users"

interface RouteContext {
  params: Promise<{ id: string }>
}

export const POST = withAuth<RouteContext>(async (_request, context) => {
  const { id } = await context.params
  try {
    const result = await resetUserPassword(id)
    return Response.json(result)
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 })
    }
    return Response.json({ error: "Gagal mereset kata sandi." }, { status: 500 })
  }
}, { permission: "users:manage" })
