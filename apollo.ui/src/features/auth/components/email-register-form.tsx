import * as React from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { AuthFormField } from "@/features/auth/components/auth-form-field"
import { AuthFormFields } from "@/features/auth/components/auth-form-fields"
import { AuthFormHeader } from "@/features/auth/components/auth-form-header"
import { AuthFormShell } from "@/features/auth/components/auth-form-shell"
import { AuthFormTerms } from "@/features/auth/components/auth-form-terms"
import { RegisterSwitchPrompt } from "@/features/auth/components/auth-form-switch-prompt"
import { AuthSocialActions } from "@/features/auth/components/auth-social-actions"
import { ApiError, useAuth } from "@/features/auth/context/auth-provider"
import { authFormButtonClass } from "@/features/auth/lib/auth-form-styles"
import {
  mapApiFieldErrors,
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/features/auth/lib/validators"
import { cn } from "@/lib/utils"

export function EmailRegisterForm() {
  const { register, isLoading } = useAuth()
  const [email, setEmail] = React.useState("")
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const nextErrors = {
      email: validateEmail(email) ?? "",
      username: validateUsername(username) ?? "",
      password: validatePassword(password) ?? "",
      confirmPassword: validateConfirmPassword(password, confirmPassword) ?? "",
    }

    const filteredErrors = Object.fromEntries(
      Object.entries(nextErrors).filter(([, message]) => message)
    )

    if (Object.keys(filteredErrors).length > 0) {
      setErrors(filteredErrors)
      return
    }

    setErrors({})

    try {
      await register({
        email: email.trim(),
        username: username.trim(),
        password,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(mapApiFieldErrors(error.errors))
        setFormError(error.message)
        return
      }
      setFormError("ثبت‌نام انجام نشد. دوباره تلاش کنید.")
    }
  }

  return (
    <AuthFormShell variant="register">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <AuthFormHeader
            title="ثبت نام"
            intro="برای ایجاد حساب کاربری جدید، اطلاعات زیر را تکمیل کنید."
          />

          <AuthFormFields>
          <AuthFormField
            id="register-email"
            label="ایمیل"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            dir="ltr"
            className="text-start"
            error={errors.email}
          />

          <AuthFormField
            id="register-username"
            label="نام کاربری"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            dir="ltr"
            className="text-start"
            error={errors.username}
          />

          <AuthFormField
            id="register-password"
            label="رمز عبور"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            dir="ltr"
            className="text-start"
            error={errors.password}
          />

          <AuthFormField
            id="register-confirm-password"
            label="تکرار رمز"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            dir="ltr"
            className="text-start"
            error={errors.confirmPassword}
          />

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          <Field>
            <Button
              type="submit"
              className={cn("w-full", authFormButtonClass)}
              disabled={isLoading}
            >
              {isLoading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
            </Button>
          </Field>

          <AuthSocialActions phoneView="register-phone" />
          </AuthFormFields>

          <div className="mt-6 flex flex-col items-center gap-1.5">
            <RegisterSwitchPrompt />
            <AuthFormTerms />
          </div>
        </FieldGroup>
      </form>
    </AuthFormShell>
  )
}
