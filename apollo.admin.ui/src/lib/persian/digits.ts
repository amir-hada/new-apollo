const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"

export function fromPersianDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(char)
    if (persianIndex >= 0) return String(persianIndex)

    const arabicIndex = ARABIC_DIGITS.indexOf(char)
    if (arabicIndex >= 0) return String(arabicIndex)

    return char
  })
}

export function parseNumericInput(value: string) {
  const normalized = fromPersianDigits(value).replace(/[^\d]/g, "")
  if (!normalized) return null

  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}
