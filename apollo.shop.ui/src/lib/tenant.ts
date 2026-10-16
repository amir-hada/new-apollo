/** Header sent to API so requests hit the correct shop (matches backend middleware). */
export const TENANT_HEADER = "X-Tenant-Slug";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080";

const RESERVED = new Set(["www", "api", "localhost"]);

/**
 * Resolve tenant slug from a hostname.
 * shop2.localhost → shop2; shop2.example.com → shop2; localhost / apex → null.
 * Bare hosts are not shops — only shop subdomains are valid storefronts.
 */
export function getTenantSlugFromHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0]?.trim().toLowerCase() ?? "";
  if (!hostname || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) return null;

  const labels = hostname.split(".").filter(Boolean);
  const isLocalhost = labels.length >= 2 && labels[labels.length - 1] === "localhost";
  if (labels.length < 3 && !isLocalhost) return null;

  const candidate = labels[0];
  if (!candidate || RESERVED.has(candidate)) return null;
  if (!/^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$/.test(candidate)) return null;
  return candidate;
}

/** Client-side current tenant slug (empty when host is not a shop subdomain). */
export function getClientTenantSlug(): string {
  if (typeof window === "undefined") return "";
  return getTenantSlugFromHost(window.location.host) ?? "";
}

/** Absolute storefront URL for a tenant slug (local subdomain or env base). */
export function tenantStorefrontUrl(slug: string): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  try {
    const url = new URL(site);
    if (url.hostname === "localhost" || url.hostname.endsWith(".localhost")) {
      url.hostname = `${slug}.localhost`;
      return url.toString().replace(/\/$/, "");
    }
    const parts = url.hostname.split(".");
    if (parts.length >= 2) {
      url.hostname = [slug, ...parts.slice(1)].join(".");
    } else {
      url.hostname = `${slug}.${url.hostname}`;
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return `http://${slug}.localhost:3000`;
  }
}
