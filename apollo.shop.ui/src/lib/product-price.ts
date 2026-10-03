import { toPersianDigits } from "@/features/auth/normalize-phone";

/** Resolve display prices: base = اصلی, discount = اختیاری با تخفیف. */
export function getProductDisplayPrices(product: {
  basePrice: number;
  discountPrice?: number | null;
}) {
  const base = product.basePrice;
  const discount = product.discountPrice;
  const hasDiscount =
    discount != null && Number.isFinite(discount) && discount > 0 && discount < base;

  const percent = hasDiscount
    ? Math.round(((base - discount!) / base) * 100)
    : null;

  return {
    current: hasDiscount ? discount! : base,
    original: hasDiscount ? base : null,
    discountPercent: percent != null && percent > 0 ? percent : null,
    discountPercentLabel:
      percent != null && percent > 0
        ? `${toPersianDigits(String(percent))}٪ تخفیف`
        : null,
  };
}
