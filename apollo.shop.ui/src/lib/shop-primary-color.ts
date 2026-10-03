/** Default Apollo shop primary (slate-900). */
export const DEFAULT_SHOP_PRIMARY = "#0f172a";

const PRESET_COLORS = [
  "#0f172a",
  "#1d4ed8",
  "#0f766e",
  "#b45309",
  "#be123c",
  "#7c3aed",
  "#15803d",
  "#0e7490",
] as const;

export const SHOP_PRIMARY_PRESETS = PRESET_COLORS;

export function normalizeHexColor(value: string | null | undefined): string | null {
  if (!value) return null;
  let hex = value.trim();
  if (!hex.startsWith("#")) hex = `#${hex}`;
  if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) return null;
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex.toLowerCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const n = normalized.slice(1);
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

/** Relative luminance for contrast (sRGB). */
function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastForeground(hex: string): string {
  return luminance(hex) > 0.45 ? "#0f172a" : "#f8fafc";
}

export const SHOP_PRIMARY_STYLE_ID = "shop-primary-vars";

export function applyShopPrimaryColor(color: string | null | undefined) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const primary = normalizeHexColor(color) || DEFAULT_SHOP_PRIMARY;
  const foreground = contrastForeground(primary);

  // Prefer inline CSS variables on <html> (set by RootLayout) so we avoid a
  // React-managed <style> in <head> that collides with next-themes during hydration.
  root.style.setProperty("--primary", primary);
  root.style.setProperty("--primary-foreground", foreground);
  root.style.setProperty("--sidebar-primary", primary);
  root.style.setProperty("--sidebar-primary-foreground", foreground);
  root.style.setProperty("--ring", primary);
  root.dataset.shopPrimary = primary;

  // Clean up any leftover SSR/client style tag from older builds.
  document.getElementById(SHOP_PRIMARY_STYLE_ID)?.remove();
}

export function shopPrimaryCssVars(
  color: string | null | undefined,
): Record<string, string> {
  const primary = normalizeHexColor(color) || DEFAULT_SHOP_PRIMARY;
  const foreground = contrastForeground(primary);
  return {
    "--primary": primary,
    "--primary-foreground": foreground,
    "--sidebar-primary": primary,
    "--sidebar-primary-foreground": foreground,
    "--ring": primary,
  };
}
