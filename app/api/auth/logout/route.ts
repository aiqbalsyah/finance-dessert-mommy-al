import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Logout failed" }, { status: 500 })
  }
}
