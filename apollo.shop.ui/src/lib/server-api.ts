import { headers } from "next/headers";
import { API_URL, DEFAULT_TENANT_SLUG, TENANT_HEADER, getTenantSlugFromHost } from "@/lib/tenant";

export { API_URL, TENANT_HEADER };

/** Resolve tenant for the current SSR request. */
export async function getServerTenantSlug(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    return getTenantSlugFromHost(host) ?? DEFAULT_TENANT_SLUG;
  } catch {
    return DEFAULT_TENANT_SLUG;
  }
}

/** Server-side fetch helper for SEO pages (sends tenant header). */
export async function serverFetch<T>(
  path: string,
  init?: RequestInit & { revalidate?: number | false; tenantSlug?: string },
): Promise<T | null> {
  try {
    const { revalidate = 60, tenantSlug, ...rest } = init ?? {};
    const slug = tenantSlug ?? (await getServerTenantSlug());
    const res = await fetch(`${API_URL}${path}`, {
      ...rest,
      ...(revalidate === false
        ? { cache: "no-store" as const }
        : { next: { revalidate } }),
      headers: {
        "Content-Type": "application/json",
        [TENANT_HEADER]: slug,
        ...(rest.headers || {}),
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
