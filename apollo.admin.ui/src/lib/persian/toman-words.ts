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
]

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
]

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
]

const hundreds = [
  "",
  "یکصد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
]

function joinParts(parts: string[]) {
  return parts.filter(Boolean).join(" و ")
}

function threeDigitsToWords(value: number) {
  if (value === 0) return ""

  const hundred = Math.floor(value / 100)
  const remainder = value % 100
  const parts: string[] = []

  if (hundred > 0) {
    parts.push(hundreds[hundred])
  }

  if (remainder > 0) {
    if (remainder < 10) {
      parts.push(ones[remainder])
    } else if (remainder < 20) {
      parts.push(teens[remainder - 10])
    } else {
      const ten = Math.floor(remainder / 10)
      const one = remainder % 10
      parts.push(joinParts([tens[ten], ones[one]]))
    }
  }

  return joinParts(parts)
}

export function numberToPersianWords(value: number) {
  if (!Number.isFinite(value) || value < 0) return ""
  if (value === 0) return "صفر"

  const billion = Math.floor(value / 1_000_000_000)
  const million = Math.floor((value % 1_000_000_000) / 1_000_000)
  const thousand = Math.floor((value % 1_000_000) / 1_000)
  const rest = value % 1_000

  const parts: string[] = []

  if (billion > 0) {
    parts.push(`${threeDigitsToWords(billion)} میلیارد`)
  }

  if (million > 0) {
    parts.push(`${threeDigitsToWords(million)} میلیون`)
  }

  if (thousand > 0) {
    parts.push(`${threeDigitsToWords(thousand)} هزار`)
  }

  if (rest > 0) {
    parts.push(threeDigitsToWords(rest))
  }

  return joinParts(parts)
}

export function formatTomanInWords(value: number | null | undefined) {
  if (!value || value <= 0) return null
  return `${numberToPersianWords(value)} تومان`
}
