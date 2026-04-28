import { withAuth } from "@/lib/auth"
import { InvalidReceiptError, uploadReceipt } from "@/lib/use-cases/uploads"

const ALLOWED_FOLDERS = new Set([
  "sales-receipts",
  "purchases-receipts",
  "salaries-receipts",
  "expenses-receipts",
])

function buildFolderPath(folder: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  return `${folder}/${year}/${month}`
}

export const POST = withAuth(async (request) => {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const folder = String(formData.get("folder") ?? "")

    if (!(file instanceof File)) {
      return Response.json({ error: "File tidak ditemukan." }, { status: 400 })
    }
    if (!ALLOWED_FOLDERS.has(folder)) {
      return Response.json({ error: "Folder tujuan tidak valid." }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadReceipt({
      buffer,
      contentType: file.type,
      folder: buildFolderPath(folder),
    })

    return Response.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof InvalidReceiptError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    return Response.json({ error: "Gagal mengunggah berkas." }, { status: 500 })
  }
}, { permission: "uploads:write" })

export const runtime = "nodejs"
