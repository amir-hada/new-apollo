import { API_URL } from "@/lib/tenant";

/** تصویر پیش‌فرض محصولات بدون عکس (فایل public/product-default.jpg) */
export const DEFAULT_PRODUCT_IMAGE = "/product-default.jpg";

/**
 * آدرس‌های LocalFileStorage مثل `/media/shop/...` نسبی‌اند و باید روی API
 * (NEXT_PUBLIC_API_URL) resolve شوند؛ وگرنه مرورگر آن‌ها را از originِ Next می‌گیرد.
 */
export function resolveProductImageUrl(url?: string | null): string {
  const trimmed = url?.trim();
  if (!trimmed) return DEFAULT_PRODUCT_IMAGE;

  if (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (path === "/media" || path.startsWith("/media/")) {
    return `${API_URL.replace(/\/$/, "")}${path}`;
  }

  return path;
}
