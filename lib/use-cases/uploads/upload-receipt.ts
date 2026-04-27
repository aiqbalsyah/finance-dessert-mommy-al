import "server-only"

import { uploadFile, type UploadResult } from "@/lib/firebase"

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
])

export const MAX_RECEIPT_SIZE_MB = 5

export class InvalidReceiptError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidReceiptError"
  }
}

export interface UploadReceiptInput {
  buffer: Buffer
  contentType: string
  folder: string
}

export async function uploadReceipt(input: UploadReceiptInput): Promise<UploadResult> {
  if (!ALLOWED_CONTENT_TYPES.has(input.contentType)) {
    throw new InvalidReceiptError(
      "Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau HEIC."
    )
  }

  const sizeMb = input.buffer.length / (1024 * 1024)
  if (sizeMb > MAX_RECEIPT_SIZE_MB) {
    throw new InvalidReceiptError(
      `Ukuran file maksimal ${MAX_RECEIPT_SIZE_MB} MB.`
    )
  }

  return uploadFile({
    folder: input.folder,
    contentType: input.contentType,
    buffer: input.buffer,
    makePublic: true,
  })
}
