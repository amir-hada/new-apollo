import { ApiError, SESSION_EXPIRED_MESSAGE } from "@/lib/api/client"

const englishMessageMap: Record<string, string> = {
  "One or more validation errors occurred.": "لطفاً اطلاعات وارد شده را بررسی کنید.",
  "یک یا چند خطای اعتبارسنجی رخ داده است.": "لطفاً اطلاعات وارد شده را بررسی کنید.",
  "Validation failed": "لطفاً اطلاعات وارد شده را بررسی کنید.",
  Unauthorized: "دسترسی مجاز نیست. لطفاً دوباره وارد شوید.",
  "Not found": "موردی یافت نشد.",
  Conflict: "این اطلاعات قبلاً ثبت شده است.",
  "Internal server error": "خطای سرور. لطفاً بعداً دوباره تلاش کنید.",
  "The MobileNumber field is required.": "شماره موبایل الزامی است.",
  "The Code field is required.": "کد تأیید الزامی است.",
  "The Purpose field is required.": "درخواست نامعتبر است. لطفاً صفحه را رفرش کنید.",
  "Email '' is invalid.": "خطا در ساخت حساب کاربری. لطفاً دوباره تلاش کنید.",
  "Optimistic concurrency failure, the object has been modified.":
    "اطلاعات توسط جلسه دیگری تغییر کرده. صفحه را رفرش کنید.",
}

const fieldNameMap: Record<string, string> = {
  Email: "email",
  Username: "username",
  Password: "password",
  MobileNumber: "mobileNumber",
  Code: "code",
  FirstName: "firstName",
  LastName: "lastName",
  NationalId: "nationalId",
  ProfilePictureUrl: "profilePictureUrl",
}

function translateMessage(message: string) {
  const trimmed = message.trim()
  return englishMessageMap[trimmed] ?? trimmed
}

function isUsefulPersianMessage(message: string) {
  const trimmed = message.trim()
  if (!trimmed) return false
  if (englishMessageMap[trimmed]) return false
  return !/^[A-Za-z0-9 .,'":;!?-]+$/.test(trimmed)
}

export function mapApiFieldErrors(errors?: Record<string, string[]>) {
  if (!errors) return {}

  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => [
      fieldNameMap[key] ?? key.charAt(0).toLowerCase() + key.slice(1),
      translateMessage(messages[0] ?? "مقدار نامعتبر است."),
    ])
  )
}

export function resolveAuthError(error: unknown) {
  if (error instanceof ApiError) {
    const fieldErrors = mapApiFieldErrors(error.errors)
    const firstFieldMessage = Object.values(fieldErrors)[0]

    if (firstFieldMessage) {
      return {
        message: firstFieldMessage,
        fieldErrors,
      }
    }

    if (error.status === 401) {
      const translatedMessage = translateMessage(error.message)

      if (error.message === SESSION_EXPIRED_MESSAGE) {
        return {
          message: SESSION_EXPIRED_MESSAGE,
          fieldErrors,
        }
      }

      if (isUsefulPersianMessage(translatedMessage)) {
        return {
          message: translatedMessage,
          fieldErrors,
        }
      }

      return {
        message: SESSION_EXPIRED_MESSAGE,
        fieldErrors,
      }
    }

    const translatedMessage = translateMessage(error.message)
    if (isUsefulPersianMessage(translatedMessage)) {
      return {
        message: translatedMessage,
        fieldErrors,
      }
    }

    return {
      message: translatedMessage || "خطایی رخ داد. دوباره تلاش کنید.",
      fieldErrors,
    }
  }

  if (error instanceof Error) {
    const translatedMessage = translateMessage(error.message).trim()
    if (translatedMessage) {
      return {
        message: translatedMessage,
        fieldErrors: {},
      }
    }
  }

  return {
    message: "خطایی رخ داد. دوباره تلاش کنید.",
    fieldErrors: {},
  }
}
