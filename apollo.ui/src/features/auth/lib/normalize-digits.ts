/** Converts Persian/Arabic digits to ASCII and strips non-digits */
export function normalizeDigits(value: string) {
  return [...value]
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0)
      if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660)
      if (code >= 0x0030 && code <= 0x0039) return char
      return ""
    })
    .join("")
}

export function normalizeMobileInput(value: string) {
  return normalizeDigits(value).slice(0, 11)
}

export function normalizeOtpInput(value: string) {
  return normalizeDigits(value).slice(0, 5)
}
