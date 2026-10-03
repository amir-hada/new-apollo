import { normalizeDigits } from "@/features/auth/lib/normalize-digits"

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const mobilePattern = /^09\d{9}$/
const usernamePattern = /^[a-zA-Z0-9_]+$/
const otpPattern = /^\d{5}$/

export function validateEmail(email: string) {
  if (!email.trim()) return "ایمیل الزامی است."
  if (!emailPattern.test(email.trim())) return "فرمت ایمیل معتبر نیست."
  return null
}

export function validatePassword(password: string) {
  if (!password) return "رمز عبور الزامی است."
  if (password.length < 8) return "رمز عبور باید حداقل ۸ کاراکتر باشد."
  if (!passwordPattern.test(password)) {
    return "رمز عبور باید شامل حروف بزرگ، حروف کوچک و عدد باشد."
  }
  return null
}

export function validateUsername(username: string) {
  if (!username.trim()) return "نام کاربری الزامی است."
  if (username.trim().length < 3) return "نام کاربری باید حداقل ۳ کاراکتر باشد."
  if (username.trim().length > 30) return "نام کاربری نباید بیشتر از ۳۰ کاراکتر باشد."
  if (!usernamePattern.test(username.trim())) {
    return "نام کاربری فقط می‌تواند شامل حروف، اعداد و زیرخط باشد."
  }
  return null
}

export function validateConfirmPassword(password: string, confirmPassword: string) {
  if (!confirmPassword) return "تکرار رمز عبور الزامی است."
  if (password !== confirmPassword) return "رمز عبور و تکرار آن یکسان نیستند."
  return null
}

export function validateMobileNumberFormat(mobileNumber: string) {
  const normalized = normalizeDigits(mobileNumber.trim())
  if (!normalized) return null
  if (!mobilePattern.test(normalized)) {
    return "فرمت شماره موبایل نامعتبر است"
  }
  return null
}

export function validateMobileNumber(mobileNumber: string) {
  const normalized = normalizeDigits(mobileNumber.trim())
  if (!normalized) return "شماره موبایل الزامی است."
  if (!mobilePattern.test(normalized)) {
    return "فرمت شماره موبایل نامعتبر است"
  }
  return null
}

export function validateOtp(code: string) {
  const normalized = normalizeDigits(code.trim())
  if (!normalized) return "کد تأیید الزامی است."
  if (!otpPattern.test(normalized)) return "کد تأیید باید ۵ رقم باشد."
  return null
}

export function isValidIranianNationalId(nationalId: string) {
  const normalized = normalizeDigits(nationalId.trim())
  if (normalized.length !== 10 || !/^\d{10}$/.test(normalized)) {
    return false
  }

  if (new Set(normalized).size === 1) {
    return false
  }

  const check = Number(normalized[9])
  const sum = normalized
    .slice(0, 9)
    .split("")
    .reduce((total, digit, index) => total + Number(digit) * (10 - index), 0)

  const remainder = sum % 11
  return remainder < 2 ? check === remainder : check + remainder === 11
}

export { mapApiFieldErrors } from "@/features/auth/lib/auth-errors"
