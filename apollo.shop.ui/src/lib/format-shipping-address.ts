type ShippingAddressFields = {
  title?: string | null;
  Title?: string | null;
  fullName?: string | null;
  FullName?: string | null;
  phone?: string | null;
  Phone?: string | null;
  province?: string | null;
  Province?: string | null;
  city?: string | null;
  City?: string | null;
  postalCode?: string | null;
  PostalCode?: string | null;
  line1?: string | null;
  Line1?: string | null;
  line2?: string | null;
  Line2?: string | null;
};

function pick(
  obj: ShippingAddressFields,
  camel: keyof ShippingAddressFields,
  pascal: keyof ShippingAddressFields,
) {
  const value = obj[camel] ?? obj[pascal];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Parse order shippingAddressSnapshot JSON into a human-readable multi-line string. */
export function formatShippingAddress(snapshot?: string | null): string {
  if (!snapshot?.trim()) return "—";

  const trimmed = snapshot.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed) as ShippingAddressFields;
    if (!parsed || typeof parsed !== "object") return trimmed;

    const title = pick(parsed, "title", "Title");
    const fullName = pick(parsed, "fullName", "FullName");
    const phone = pick(parsed, "phone", "Phone");
    const province = pick(parsed, "province", "Province");
    const city = pick(parsed, "city", "City");
    const postalCode = pick(parsed, "postalCode", "PostalCode");
    const line1 = pick(parsed, "line1", "Line1");
    const line2 = pick(parsed, "line2", "Line2");

    const lines: string[] = [];
    if (title || fullName) {
      lines.push([title, fullName].filter(Boolean).join(" — "));
    }
    const location = [province, city].filter(Boolean).join("، ");
    const street = [line1, line2].filter(Boolean).join("، ");
    if (location || street) {
      lines.push([location, street].filter(Boolean).join("، "));
    }
    if (postalCode) lines.push(`کد پستی: ${postalCode}`);
    if (phone) lines.push(`تلفن: ${phone}`);

    return lines.length > 0 ? lines.join("\n") : trimmed;
  } catch {
    return trimmed;
  }
}
