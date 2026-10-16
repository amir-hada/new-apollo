import { cache } from "react";
import { headers } from "next/headers";
import { API_URL, TENANT_HEADER, getTenantSlugFromHost } from "@/lib/tenant";

export { API_URL, TENANT_HEADER };

/** Resolve tenant slug from the request host (null on bare localhost / apex). */
export async function getServerTenantSlug(): Promise<string | null> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    return getTenantSlugFromHost(host);
  } catch {
    return null;
  }
}

/**
 * Confirms the current host is a shop subdomain of an active tenant.
 * Bare hosts (e.g. http://localhost:3000) are never valid shops.
 * Cached per request so layout + metadata share one probe.
 */
export const isActiveTenant = cache(async (): Promise<boolean> => {
  try {
    const slug = await getServerTenantSlug();
    if (!slug) return false;

    const res = await fetch(`${API_URL}/api/shop-settings`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        [TENANT_HEADER]: slug,
      },
    });
    return res.status !== 404;
  } catch {
    // Host already validated as a subdomain; keep page usable if API is briefly down.
    return true;
  }
});

/** Server-side fetch helper for SEO pages (sends tenant header). */
export async function serverFetch<T>(
  path: string,
  init?: RequestInit & { revalidate?: number | false; tenantSlug?: string },
): Promise<T | null> {
  try {
    const { revalidate = 60, tenantSlug, ...rest } = init ?? {};
    const slug = tenantSlug ?? (await getServerTenantSlug());
    if (!slug) return null;

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
