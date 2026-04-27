import { useMutation } from "@tanstack/react-query"

import { ApiError } from "@/lib/fetch"

export type UploadFolder =
  | "sales-receipts"
  | "purchases-receipts"
  | "salaries-receipts"
  | "expenses-receipts"

export interface ReceiptUploadResult {
  path: string
  url: string
  contentType: string
  size: number
}

export interface UploadReceiptVariables {
  file: File
  folder: UploadFolder
}

async function uploadReceipt({ file, folder }: UploadReceiptVariables): Promise<ReceiptUploadResult> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", folder)

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new ApiError(response.status, body.error ?? "Gagal mengunggah berkas.")
  }

  return (await response.json()) as ReceiptUploadResult
}

export function useUploadReceipt() {
  return useMutation({ mutationFn: uploadReceipt })
}
