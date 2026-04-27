import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/services/auth"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    const user = await getCurrentUser(token)

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    return Response.json(user)
  } catch {
    return Response.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
