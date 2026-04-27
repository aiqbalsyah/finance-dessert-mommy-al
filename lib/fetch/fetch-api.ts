import { ApiError } from "./api-error";

export async function fetchApi<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    const message = await res.text().catch(() => "Request failed");
    throw new ApiError(res.status, message);
  }

  return res.json();
}
