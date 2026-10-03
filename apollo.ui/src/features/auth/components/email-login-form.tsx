import * as React from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { AuthFormField } from "@/features/auth/components/auth-form-field"
import { AuthFormFields } from "@/features/auth/components/auth-form-fields"
import { AuthFormHeader } from "@/features/auth/components/auth-form-header"
import { AuthFormShell } from "@/features/auth/components/auth-form-shell"
import { AuthFormTerms } from "@/features/auth/components/auth-form-terms"
import { LoginSwitchPrompt } from "@/features/auth/components/auth-form-switch-prompt"
import { AuthSocialActions } from "@/features/auth/components/auth-social-actions"
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link"
import { authFormButtonClass } from "@/features/auth/lib/auth-form-styles"
import { ApiError, useAuth } from "@/features/auth/context/auth-provider"
import { cn } from "@/lib/utils"
import {
  mapApiFieldErrors,
  validateEmail,
} from "@/features/auth/lib/validators"

export function EmailLoginForm() {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const nextErrors = {
      email: validateEmail(email) ?? "",
      password: !password ? "رمز عبور الزامی است." : "",
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
      await login({ email: email.trim(), password })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(mapApiFieldErrors(error.errors))
        setFormError(error.message)
        return
      }
      setFormError("ورود انجام نشد. دوباره تلاش کنید.")
    }
  }

  return (
    <AuthFormShell variant="login">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <AuthFormHeader logoClassName="size-24" />

          <AuthFormFields>
          <AuthFormField
            id="login-email"
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
            id="login-password"
            label="رمز عبور"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            dir="ltr"
            className="text-start"
            error={errors.password}
            footer={
              <div className="flex justify-end">
                <AuthSwitchLink view="forgot-password" className="text-xs font-light">
                  فراموشی رمز؟
                </AuthSwitchLink>
              </div>
            }
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
              {isLoading ? "در حال ورود..." : "ورود"}
            </Button>
          </Field>

          <AuthSocialActions phoneView="login-phone" />
          </AuthFormFields>

          <div className="mt-6 flex flex-col items-center gap-1.5">
            <LoginSwitchPrompt />
            <AuthFormTerms />
          </div>
        </FieldGroup>
      </form>
    </AuthFormShell>
  )
}
