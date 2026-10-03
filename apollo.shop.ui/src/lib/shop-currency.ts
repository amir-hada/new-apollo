import { toPersianDigits } from "@/features/auth/normalize-phone";

export const SHOP_CURRENCIES = [
  { value: "تومان", label: "تومان" },
  { value: "ریال", label: "ریال" },
] as const;

export type ShopCurrency = (typeof SHOP_CURRENCIES)[number]["value"];

/** قیمت‌ها در API/دیتابیس همیشه بر حسب تومان هستند. */
let activeShopCurrency: ShopCurrency = "تومان";

export function normalizeShopCurrency(value?: string | null): ShopCurrency {
  const raw = (value ?? "").trim().toLowerCase();
  if (
    raw === "ریال" ||
    raw === "rial" ||
    raw === "irr" ||
    raw === "ریال ایران"
  ) {
    return "ریال";
  }
  return "تومان";
}

export function setActiveShopCurrency(value?: string | null) {
  activeShopCurrency = normalizeShopCurrency(value);
}

export function getActiveShopCurrency(): ShopCurrency {
  return activeShopCurrency;
}

/** تبدیل مبلغ ذخیره‌شده (تومان) به مبلغ قابل‌نمایش. */
export function toDisplayAmount(
  valueInToman: number,
  currency: ShopCurrency = getActiveShopCurrency(),
) {
  const n = Number.isFinite(valueInToman) ? valueInToman : 0;
  const rounded = Math.round(n);
  return currency === "ریال" ? rounded * 10 : rounded;
}

/**
 * نمایش قیمت بر اساس واحد فروشگاه.
 * @param valueInToman مبلغ ذخیره‌شده بر حسب تومان
 */
export function formatPrice(
  valueInToman: number,
  currency?: string | null,
) {
  const unit = normalizeShopCurrency(currency ?? activeShopCurrency);
  const amount = toDisplayAmount(valueInToman, unit);
  const formatted = toPersianDigits(
    new Intl.NumberFormat("fa-IR").format(amount),
  );
  return `${formatted} ${unit}`;
}

export function currencyLabel(currency?: string | null) {
  return normalizeShopCurrency(currency);
}
