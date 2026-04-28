import { withAuth } from "@/lib/auth"
import { getAccountBalances } from "@/lib/use-cases/reports"

export const GET = withAuth(async () => {
  try {
    const data = await getAccountBalances()
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat saldo rekening." }, { status: 500 })
  }
}, { permission: "reports:read" })
