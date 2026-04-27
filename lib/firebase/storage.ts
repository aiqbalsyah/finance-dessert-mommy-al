import "server-only"

import { randomUUID } from "node:crypto"

import { getDefaultBucket } from "./admin"

export interface UploadResult {
  path: string
  url: string
  contentType: string
  size: number
}

export interface UploadOptions {
  folder: string
  fileName?: string
  contentType: string
  buffer: Buffer
  makePublic?: boolean
}

export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const bucket = getDefaultBucket()
  const safeFileName = options.fileName ?? randomUUID()
  const path = `${options.folder}/${safeFileName}`

  const file = bucket.file(path)
  await file.save(options.buffer, {
    contentType: options.contentType,
    resumable: false,
    metadata: { contentType: options.contentType },
  })

  if (options.makePublic) {
    await file.makePublic()
    return {
      path,
      url: file.publicUrl(),
      contentType: options.contentType,
      size: options.buffer.length,
    }
  }

  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
  })

  return {
    path,
    url: signedUrl,
    contentType: options.contentType,
    size: options.buffer.length,
  }
}

export async function deleteFile(path: string): Promise<void> {
  const bucket = getDefaultBucket()
  await bucket.file(path).delete({ ignoreNotFound: true })
}

export async function getReadSignedUrl(path: string, expiresInMs: number = 1000 * 60 * 60): Promise<string> {
  const bucket = getDefaultBucket()
  const [url] = await bucket.file(path).getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInMs,
  })
  return url
}
