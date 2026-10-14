const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/

/** Base domain used for storefront preview (e.g. `localhost:3000`). */
export const SHOP_BASE_DOMAIN =
  import.meta.env.VITE_SHOP_BASE_DOMAIN ?? "localhost:3000"

/** Lowercases and strips characters not allowed in a slug while typing. */
export function sanitizeSlugInput(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "")
}

export function validateSlug(value: string): string | null {
  const slug = value.trim()
  if (!slug) return "آدرس سایت (slug) الزامی است."
  if (slug.length > 63) return "آدرس سایت نباید بیشتر از ۶۳ کاراکتر باشد."
  if (!SLUG_PATTERN.test(slug)) {
    return "فقط حروف کوچک انگلیسی، عدد و خط تیره (بدون شروع/پایان با خط تیره) مجاز است."
  }
  return null
}

export function buildSlugPreview(slug: string) {
  return `${slug || "your-slug"}.${SHOP_BASE_DOMAIN}`
}
