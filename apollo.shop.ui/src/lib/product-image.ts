/** تصویر پیش‌فرض محصولات بدون عکس (فایل public/product-default.jpg) */
export const DEFAULT_PRODUCT_IMAGE = "/product-default.jpg";

/** اگر آدرس خالی باشد، تصویر پیش‌فرض برمی‌گردد */
export function resolveProductImageUrl(url?: string | null): string {
  const trimmed = url?.trim();
  return trimmed || DEFAULT_PRODUCT_IMAGE;
}
