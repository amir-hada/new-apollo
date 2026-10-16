/** نگاشت نام‌های رایج فارسی به کد رنگ (fallback وقتی ColorHex ذخیره نشده) */
const COLOR_MAP: Record<string, string> = {
  "آبی تیره": "#1e3a8a",
  "آبی روشن": "#93c5fd",
  "آبی آسمانی": "#38bdf8",
  "سبز تیره": "#14532d",
  "سبز روشن": "#86efac",
  "قرمز تیره": "#7f1d1d",
  "صورتی روشن": "#fbcfe8",
  "خاکستری تیره": "#374151",
  "خاکستری روشن": "#d1d5db",
  "قهوه‌ای تیره": "#78350f",
  مشکی: "#111111",
  سیاه: "#111111",
  سفید: "#f5f5f5",
  قرمز: "#e11d48",
  آبی: "#2563eb",
  سبز: "#16a34a",
  زرد: "#eab308",
  نارنجی: "#f97316",
  صورتی: "#ec4899",
  بنفش: "#7c3aed",
  خاکستری: "#6b7280",
  طوسی: "#9ca3af",
  طلایی: "#ca8a04",
  نقره‌ای: "#a3a3a3",
  نقره: "#a3a3a3",
  کرم: "#f5e6c8",
  قهوه‌ای: "#92400e",
  بژ: "#d6c3a8",
  سرمه‌ای: "#0f172a",
  زیتونی: "#65a30d",
  فیروزه‌ای: "#14b8a6",
  شفاف: "#e5e7eb",
  استیل: "#94a3b8",
};

function normalizeHex(raw?: string | null): string | null {
  if (!raw?.trim()) return null;
  let hex = raw.trim();
  if (!hex.startsWith("#")) hex = `#${hex}`;
  if (hex.length !== 4 && hex.length !== 7) return null;
  if (!/^#[0-9a-fA-F]+$/.test(hex)) return null;
  return hex.toLowerCase();
}

function guessFromLabel(label: string): string {
  const text = label.trim();
  // اول عبارت‌های بلندتر (آبی تیره قبل از آبی)
  const keys = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);
  const key = keys.find((k) => text.includes(k));
  return key ? COLOR_MAP[key]! : "#d4d4d8";
}

/** رنگ نهایی سواچ: ColorHex ذخیره‌شده یا حدس از نام */
export function resolveSwatchColor(
  label: string,
  colorHex?: string | null,
): string {
  return normalizeHex(colorHex) ?? guessFromLabel(label);
}

export function isLightSwatch(hexOrLabel: string): boolean {
  const hex = normalizeHex(hexOrLabel);
  if (hex) {
    const full =
      hex.length === 4
        ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
        : hex;
    const r = parseInt(full.slice(1, 3), 16);
    const g = parseInt(full.slice(3, 5), 16);
    const b = parseInt(full.slice(5, 7), 16);
    // luminance تقریبی
    return (0.299 * r + 0.587 * g + 0.114 * b) > 186;
  }
  return /سفید|کرم|زرد|نقره|روشن|بژ|شفاف/.test(hexOrLabel);
}

export function looksLikeColorSpec(name: string): boolean {
  return /رنگ|color|colour/i.test(name);
}

/** پیشنهاد اولیه hex هنگام تایپ نام رنگ */
export function suggestColorHex(label: string): string {
  return guessFromLabel(label);
}
