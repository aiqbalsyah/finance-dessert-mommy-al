const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "";

export async function serviceGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_API_URL}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function servicePost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BACKEND_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function servicePut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BACKEND_API_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function serviceDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${BACKEND_API_URL}${path}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
