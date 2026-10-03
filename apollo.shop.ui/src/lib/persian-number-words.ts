import { normalizeShopCurrency } from "@/lib/shop-currency";

/** Convert a non-negative integer to Persian words (e.g. 230000 → دویست و سی هزار). */
export function numberToPersianWords(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "";
  const n = Math.floor(value);
  if (n === 0) return "صفر";

  const ones = [
    "",
    "یک",
    "دو",
    "سه",
    "چهار",
    "پنج",
    "شش",
    "هفت",
    "هشت",
    "نه",
  ];
  const teens = [
    "ده",
    "یازده",
    "دوازده",
    "سیزده",
    "چهارده",
    "پانزده",
    "شانزده",
    "هفده",
    "هجده",
    "نوزده",
  ];
  const tens = [
    "",
    "",
    "بیست",
    "سی",
    "چهل",
    "پنجاه",
    "شصت",
    "هفتاد",
    "هشتاد",
    "نود",
  ];
  const hundreds = [
    "",
    "صد",
    "دویست",
    "سیصد",
    "چهارصد",
    "پانصد",
    "ششصد",
    "هفتصد",
    "هشتصد",
    "نهصد",
  ];

  const join = (parts: string[]) => parts.filter(Boolean).join(" و ");

  const underThousand = (num: number): string => {
    if (num === 0) return "";
    if (num < 10) return ones[num]!;
    if (num < 20) return teens[num - 10]!;
    if (num < 100) {
      const t = Math.floor(num / 10);
      const o = num % 10;
      return join([tens[t]!, ones[o]!]);
    }
    const h = Math.floor(num / 100);
    const rest = num % 100;
    return join([hundreds[h]!, underThousand(rest)]);
  };

  const scales = [
    { value: 1_000_000_000, label: "میلیارد" },
    { value: 1_000_000, label: "میلیون" },
    { value: 1_000, label: "هزار" },
  ] as const;

  let remaining = n;
  const parts: string[] = [];

  for (const scale of scales) {
    if (remaining >= scale.value) {
      const count = Math.floor(remaining / scale.value);
      remaining %= scale.value;
      const countWords = underThousand(count);
      parts.push(
        count === 1 && scale.label === "هزار"
          ? "هزار"
          : `${countWords} ${scale.label}`,
      );
    }
  }

  if (remaining > 0) {
    parts.push(underThousand(remaining));
  }

  return join(parts);
}

export function priceToPersianWords(
  value: number,
  currency: string = "تومان",
) {
  if (!Number.isFinite(value) || value < 0) return "";
  const unit = normalizeShopCurrency(currency);
  const amount = unit === "ریال" ? Math.floor(value) * 10 : Math.floor(value);
  return `${numberToPersianWords(amount)} ${unit}`;
}
