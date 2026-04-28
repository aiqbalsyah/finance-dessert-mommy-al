import { cookies } from "next/headers"

import { revokeRefreshTokens, verifyIdToken } from "@/lib/services/auth"

export async function POST() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (token) {
    try {
      const decoded = await verifyIdToken(token)
      await revokeRefreshTokens(decoded.uid).catch(() => undefined)
    } catch {
      // Token invalid — proceed with cookie clear anyway.
    }
  }

  cookieStore.delete("auth-token")
  return Response.json({ success: true })
}
