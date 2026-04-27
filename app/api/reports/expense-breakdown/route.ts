import { getExpenseBreakdown } from "@/lib/use-cases/reports"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = Number(searchParams.get("from"))
    const to = Number(searchParams.get("to"))
    if (!from || !to) {
      return Response.json({ error: "Parameter from dan to wajib diisi." }, { status: 400 })
    }
    const data = await getExpenseBreakdown({ from, to })
    return Response.json(data)
  } catch {
    return Response.json({ error: "Gagal memuat breakdown pengeluaran." }, { status: 500 })
  }
}
