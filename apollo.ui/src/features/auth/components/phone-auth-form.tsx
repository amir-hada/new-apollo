import * as React from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"
import { AuthFormAlert } from "@/features/auth/components/auth-form-alert"
import { AuthFormField } from "@/features/auth/components/auth-form-field"
import { AuthFormFields } from "@/features/auth/components/auth-form-fields"
import { AuthFormHeader } from "@/features/auth/components/auth-form-header"
import { AuthFormShell } from "@/features/auth/components/auth-form-shell"
import { AuthFormTerms } from "@/features/auth/components/auth-form-terms"
import { OtpInput } from "@/features/auth/components/otp-input"
import { useAuth } from "@/features/auth/context/auth-provider"
import { resolveAuthError } from "@/features/auth/lib/auth-errors"
import { normalizeMobileInput } from "@/features/auth/lib/normalize-digits"
import {
  validateMobileNumber,
  validateMobileNumberFormat,
  validateOtp,
} from "@/features/auth/lib/validators"
import { authFormButtonClass } from "@/features/auth/lib/auth-form-styles"
import { authApi } from "@/lib/api/auth-api"
import { ApiError } from "@/lib/api/client"
import { dashboardToast } from "@/lib/dashboard-toast"
import { cn } from "@/lib/utils"

const RESEND_COOLDOWN_SECONDS = 60

export function PhoneAuthForm() {
  const { verifyPhone, isLoading } = useAuth()
  const [step, setStep] = React.useState<"mobile" | "otp">("mobile")
  const [mobileNumber, setMobileNumber] = React.useState("")
  const [code, setCode] = React.useState("")
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isSending, setIsSending] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [resendSeconds, setResendSeconds] = React.useState(0)
  const [mobileTouched, setMobileTouched] = React.useState(false)

  function clearErrors() {
    setFieldErrors({})
    setFormError(null)
  }

  function setFieldValidationError(field: string, message: string) {
    setFieldErrors({ [field]: message })
  }

  function setValidationError(message: string, field?: string) {
    setFormError(message)
    setFieldErrors(field ? { [field]: message } : {})
  }

  function resolveMobileFieldError(value: string, showRequired = false) {
    const formatError = validateMobileNumberFormat(value)
    if (formatError) return formatError
    if (showRequired) return validateMobileNumber(value)
    return null
  }

  function updateMobileFieldError(value: string, showRequired = false) {
    const error = resolveMobileFieldError(value, showRequired)
    setFieldErrors((prev) => {
      if (!error) {
        const { mobileNumber: _, ...rest } = prev
        return rest
      }
      return { ...prev, mobileNumber: error }
    })
  }

  function startResendCooldown() {
    setResendSeconds(RESEND_COOLDOWN_SECONDS)
  }

  React.useEffect(() => {
    if (step !== "otp" || resendSeconds <= 0) return

    const timer = window.setInterval(() => {
      setResendSeconds((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [step, resendSeconds])

  function handleAccessDenied(error: unknown) {
    if (error instanceof ApiError && error.status === 403) {
      dashboardToast.error(
        error.message || "دسترسی شما غیرفعال شده است. لطفاً با پشتیبانی تماس بگیرید."
      )
      return true
    }

    return false
  }

  async function sendOtpCode() {
    clearErrors()
    setIsSending(true)

    try {
      await authApi.sendOtp({ mobileNumber: mobileNumber.trim() })
      setStep("otp")
      setCode("")
      startResendCooldown()
    } catch (error) {
      if (handleAccessDenied(error)) {
        return
      }

      const resolved = resolveAuthError(error)
      setFormError(resolved.message)
      setFieldErrors(resolved.fieldErrors)
      throw error
    } finally {
      setIsSending(false)
    }
  }

  async function handleSendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setMobileTouched(true)

    const mobileError = validateMobileNumber(mobileNumber)
    if (mobileError) {
      setFieldValidationError("mobileNumber", mobileError)
      return
    }

    await sendOtpCode()
  }

  async function handleResendOtp() {
    if (resendSeconds > 0 || isSending) return
    await sendOtpCode()
  }

  async function submitVerification(otpCode: string) {
    if (isVerifying || isLoading) return

    clearErrors()

    const otpError = validateOtp(otpCode)
    if (otpError) {
      setValidationError(otpError, "code")
      return
    }

    setIsVerifying(true)
    try {
      await verifyPhone({
        mobileNumber: mobileNumber.trim(),
        code: otpCode.trim(),
      })
    } catch (error) {
      if (handleAccessDenied(error)) {
        return
      }

      const resolved = resolveAuthError(error)
      setFormError(resolved.message)
      setFieldErrors(resolved.fieldErrors)
    } finally {
      setIsVerifying(false)
    }
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitVerification(code)
  }

  return (
    <AuthFormShell variant="login">
      <form onSubmit={step === "mobile" ? handleSendOtp : handleVerifyOtp}>
        <FieldGroup>
          <AuthFormHeader
            logoClassName="size-24"
            title={step === "mobile" ? "ورود | ثبت نام" : "تأیید شماره موبایل"}
            intro={
              step === "mobile"
                ? "شماره موبایل خود را وارد کنید."
                : undefined
            }
          />

          {formError ? <AuthFormAlert message={formError} /> : null}

          <AuthFormFields>
            {step === "mobile" ? (
              <AuthFormField
                id="auth-mobile"
                label="شماره موبایل"
                inputMode="numeric"
                value={mobileNumber}
                onChange={(event) => {
                  const nextValue = normalizeMobileInput(event.target.value)
                  setMobileNumber(nextValue)
                  if (formError) setFormError(null)
                  updateMobileFieldError(
                    nextValue,
                    mobileTouched && !nextValue.trim()
                  )
                }}
                onBlur={() => {
                  setMobileTouched(true)
                  updateMobileFieldError(mobileNumber, true)
                }}
                dir="ltr"
                className="text-start"
                error={fieldErrors.mobileNumber}
              />
            ) : (
              <>
                <FieldDescription className="text-center text-xs font-light text-muted-foreground">
                  کد ارسال شده به{" "}
                  <span dir="ltr" className="inline-block font-normal text-foreground">
                    {mobileNumber}
                  </span>{" "}
                  را وارد کنی
                </FieldDescription>

                <Field>
                  <OtpInput
                    value={code}
                    autoFocus
                    invalid={Boolean(fieldErrors.code)}
                    disabled={isLoading || isVerifying}
                    onChange={(nextCode) => {
                      setCode(nextCode)
                      if (fieldErrors.code || formError) {
                        clearErrors()
                      }
                    }}
                    onComplete={(otpCode) => {
                      void submitVerification(otpCode)
                    }}
                  />
                </Field>

                <div className="flex flex-col items-center gap-1.5 text-center text-xs font-light">
                  <button
                    type="button"
                    className="text-primary transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={resendSeconds > 0 || isSending}
                    onClick={handleResendOtp}
                  >
                    {isSending
                      ? "در حال ارسال..."
                      : resendSeconds > 0
                        ? `ارسال مجدد کد (${resendSeconds})`
                        : "ارسال مجدد کد"}
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-primary hover:underline"
                    onClick={() => {
                      setStep("mobile")
                      setCode("")
                      setResendSeconds(0)
                      setMobileTouched(false)
                      clearErrors()
                    }}
                  >
                    تغییر شماره موبایل
                  </button>
                </div>
              </>
            )}

            <Field>
              <Button
                type="submit"
                className={cn("w-full", authFormButtonClass)}
                disabled={step === "mobile" ? isSending : isLoading || isVerifying}
              >
                {step === "mobile"
                  ? isSending
                    ? "در حال ارسال..."
                    : "ارسال پیامک"
                  : isLoading || isVerifying
                    ? "در حال تأیید..."
                    : "تایید"}
              </Button>
            </Field>

          </AuthFormFields>

          <div className="mt-6">
            <AuthFormTerms />
          </div>
        </FieldGroup>
      </form>
    </AuthFormShell>
  )
}
