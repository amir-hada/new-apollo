export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080";

/** Server-side fetch helper for SEO pages */
export async function serverFetch<T>(
  path: string,
  init?: RequestInit & { revalidate?: number | false },
): Promise<T | null> {
  try {
    const { revalidate = 60, ...rest } = init ?? {};
    const res = await fetch(`${API_URL}${path}`, {
      ...rest,
      ...(revalidate === false
        ? { cache: "no-store" as const }
        : { next: { revalidate } }),
      headers: {
        "Content-Type": "application/json",
        ...(rest.headers || {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
