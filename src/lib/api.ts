const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

