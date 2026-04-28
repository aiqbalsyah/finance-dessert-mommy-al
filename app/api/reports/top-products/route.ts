import { withAuth } from "@/lib/auth"
import { getTopProducts } from "@/lib/use-cases/reports"

export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url)
    const from = Number(searchParams.get("from"))
    const to = Number(searchParams.get("to"))
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined
    if (!from || !to) {
      return Response.json({ error: "Parameter from dan to wajib diisi." }, { status: 400 })
    }
    const data = await getTopProducts({ from, to, limit })
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat produk terlaris." }, { status: 500 })
  }
}, { permission: "reports:read" })
