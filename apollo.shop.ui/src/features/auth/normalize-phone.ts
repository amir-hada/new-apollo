/** Converts Persian/Arabic digits to ASCII and strips non-digits. */
export function normalizeDigits(value: string) {
  return [...value]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
      if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
      if (code >= 0x0030 && code <= 0x0039) return char;
      return "";
    })
    .join("");
}

/** Converts ASCII/Arabic digits to Persian digits (۰-۹); keeps other characters. */
export function toPersianDigits(value: string) {
  return [...value]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 0x0030 && code <= 0x0039) {
        return String.fromCharCode(0x06f0 + (code - 0x0030));
      }
      if (code >= 0x06f0 && code <= 0x06f9) return char;
      if (code >= 0x0660 && code <= 0x0669) {
        return String.fromCharCode(0x06f0 + (code - 0x0660));
      }
      return char;
    })
    .join("");
}

export function normalizePhoneInput(value: string) {
  return normalizeDigits(value).slice(0, 11);
}

/** Display value for phone input: Persian digits only. */
export function formatPhoneDisplay(value: string) {
  return toPersianDigits(normalizeDigits(value)).slice(0, 11);
}

/** Display numeric input with Persian digits and thousand separators (e.g. ۱٬۲۳۴٬۵۶۷). */
export function formatGroupedPersianDigits(value: string) {
  const digits = normalizeDigits(value);
  if (!digits) return "";
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return toPersianDigits(grouped);
}

export function normalizeOtpInput(value: string) {
  return normalizeDigits(value).slice(0, 5);
}

/** Display value for OTP: Persian digits only. */
export function formatOtpDisplay(value: string) {
  return toPersianDigits(normalizeDigits(value)).slice(0, 5);
}

const mobilePattern = /^09\d{9}$/;

export function isValidIranianMobile(phone: string) {
  return mobilePattern.test(normalizeDigits(phone.trim()));
}

/** True when input is only digits (any script) and forms a complete Iranian mobile. */
export function isCompleteIranianMobileInput(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  const digits = normalizeDigits(trimmed);
  if (!isValidIranianMobile(digits)) return false;
  // Reject if there is any non-digit character besides whitespace
  const withoutDigits = trimmed
    .replace(/[\u06F0-\u06F9]/g, "")
    .replace(/[\u0660-\u0669]/g, "")
    .replace(/[0-9]/g, "")
    .replace(/\s/g, "");
  return withoutDigits.length === 0;
}

/** Format identifier field: phone digits → Persian, otherwise keep username text. */
export function formatIdentifierInput(value: string) {
  const trimmed = value;
  const withoutDigitScripts = trimmed
    .replace(/[\u06F0-\u06F9]/g, "")
    .replace(/[\u0660-\u0669]/g, "")
    .replace(/[0-9]/g, "")
    .replace(/\s/g, "");
  if (withoutDigitScripts.length > 0) {
    return trimmed.slice(0, 64);
  }
  return formatPhoneDisplay(trimmed);
}

export function formatTimer(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const latin = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return toPersianDigits(latin);
}
