import * as jalaali from "jalaali-js"

export type JalaliDateParts = {
  year: number
  month: number
  day: number
}

export type JalaliMonthView = Pick<JalaliDateParts, "year" | "month">

export const PERSIAN_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const

export const PERSIAN_WEEKDAY_NAMES = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const

export function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)])
}

export function getTodayJalali(): JalaliDateParts {
  const now = new Date()
  const { jy, jm, jd } = jalaali.toJalaali(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate()
  )

  return { year: jy, month: jm, day: jd }
}

export function jalaliToDate(parts: JalaliDateParts) {
  const { gy, gm, gd } = jalaali.toGregorian(parts.year, parts.month, parts.day)
  return new Date(gy, gm - 1, gd)
}

export function dateToJalali(date: Date): JalaliDateParts {
  const { jy, jm, jd } = jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )

  return { year: jy, month: jm, day: jd }
}

export function formatJalaliDate(parts: JalaliDateParts) {
  const month = String(parts.month).padStart(2, "0")
  const day = String(parts.day).padStart(2, "0")
  return toPersianDigits(`${parts.year}/${month}/${day}`)
}

export function parseIsoDate(value: string | null | undefined) {
  if (!value) return null

  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return null

  const date = new Date(year, month - 1, day)
  if (Number.isNaN(date.getTime())) return null

  return date
}

export function toIsoDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function isoDateToJalali(value: string | null | undefined) {
  const date = parseIsoDate(value)
  return date ? dateToJalali(date) : null
}

export function jalaliToIsoDate(parts: JalaliDateParts) {
  return toIsoDateString(jalaliToDate(parts))
}

export function getJalaliWeekday(parts: JalaliDateParts) {
  const date = jalaliToDate(parts)
  return (date.getDay() + 1) % 7
}

export function getJalaliMonthLength(year: number, month: number) {
  return jalaali.jalaaliMonthLength(year, month)
}

export function shiftJalaliMonth(
  parts: JalaliMonthView,
  offset: number
): JalaliMonthView {
  let year = parts.year
  let month = parts.month + offset

  while (month > 12) {
    month -= 12
    year += 1
  }

  while (month < 1) {
    month += 12
    year -= 1
  }

  return { year, month }
}

export function isSameJalaliDate(
  left: JalaliDateParts | null | undefined,
  right: JalaliDateParts | null | undefined
) {
  if (!left || !right) return false

  return (
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day
  )
}

export function getMonthGrid(year: number, month: number) {
  const monthLength = getJalaliMonthLength(year, month)
  const firstWeekday = getJalaliWeekday({ year, month, day: 1 })
  const cells: Array<JalaliDateParts | null> = []

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= monthLength; day += 1) {
    cells.push({ year, month, day })
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

export function startOfDayTimestamp(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime()
}

export function endOfDayTimestamp(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  ).getTime()
}
