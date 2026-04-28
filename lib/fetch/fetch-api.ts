import { ApiError } from "./api-error"

export async function fetchApi<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, options)

  if (!res.ok) {
    let message = "Permintaan gagal."
    try {
      const body = await res.clone().json()
      if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
        message = body.error
      }
    } catch {
      const text = await res.text().catch(() => "")
      if (text) message = text
    }
    throw new ApiError(res.status, message)
  }

  return res.json()
}
