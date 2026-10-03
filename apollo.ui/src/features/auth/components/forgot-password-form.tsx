import * as React from "react"

import { Button } from "@/components/ui/button"
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"
import { AuthFormField } from "@/features/auth/components/auth-form-field"
import { AuthFormFields } from "@/features/auth/components/auth-form-fields"
import { AuthFormHeader } from "@/features/auth/components/auth-form-header"
import { AuthFormShell } from "@/features/auth/components/auth-form-shell"
import { AuthFormTerms } from "@/features/auth/components/auth-form-terms"
import { ApiError, useAuth } from "@/features/auth/context/auth-provider"
import { validateEmail } from "@/features/auth/lib/validators"

export function ForgotPasswordForm() {
  const { forgotPassword, isLoading } = useAuth()
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    try {
      const message = await forgotPassword({ email: email.trim() })
      setSuccess(message)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        return
      }
      setError("ارسال درخواست انجام نشد.")
    }
  }

  return (
    <AuthFormShell variant="login">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <AuthFormHeader
            title="فراموشی رمز عبور"
            description={
              <>
                ایمیل خود را وارد کنید.{" "}
                <AuthSwitchLink view="login" className="text-xs font-light">
                  بازگشت به ورود
                </AuthSwitchLink>
              </>
            }
          />

          <AuthFormFields>
            <AuthFormField
              id="forgot-email"
              label="ایمیل"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              dir="ltr"
              className="text-start"
              error={error && !success ? error : null}
            />

            {success && (
              <FieldDescription className="text-center text-xs font-light text-primary">
                {success}
              </FieldDescription>
            )}

            <Field>
              <Button
                type="submit"
                className="w-full font-light"
                disabled={isLoading}
              >
                {isLoading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
              </Button>
            </Field>

            <AuthFormTerms />
          </AuthFormFields>
        </FieldGroup>
      </form>
    </AuthFormShell>
  )
}
