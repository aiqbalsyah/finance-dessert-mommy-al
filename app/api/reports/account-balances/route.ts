import { getAccountBalances } from "@/lib/use-cases/reports"

export async function GET() {
  try {
    const data = await getAccountBalances()
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat saldo rekening." }, { status: 500 })
  }
}
