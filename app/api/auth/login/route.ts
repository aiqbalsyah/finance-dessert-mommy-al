import { cookies } from "next/headers"
import { login } from "@/lib/services/auth"
import type { LoginPayload } from "@/types/auth"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginPayload
    const data = await login(body)

    const cookieStore = await cookies()
    cookieStore.set("auth-token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return Response.json(data)
  } catch {
    return Response.json({ error: "Login failed" }, { status: 401 })
  }
}
