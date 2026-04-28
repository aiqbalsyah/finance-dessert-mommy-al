import { withAuth } from "@/lib/auth"

export const GET = withAuth(async (_request, _ctx, user) => {
  return Response.json(user)
}, { allowAny: true })
