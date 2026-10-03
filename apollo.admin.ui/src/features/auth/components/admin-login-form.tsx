import * as React from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { AuthFormField } from "@/features/auth/components/auth-form-field"
import { AuthFormFields } from "@/features/auth/components/auth-form-fields"
import { AuthFormHeader } from "@/features/auth/components/auth-form-header"
import { AuthFormShell } from "@/features/auth/components/auth-form-shell"
import { authFormButtonClass } from "@/features/auth/lib/auth-form-styles"
import { mapApiFieldErrors } from "@/features/auth/lib/validators"
import { ApiError, useAuth } from "@/features/auth/context/auth-provider"
import { cn } from "@/lib/utils"

export function AdminLoginForm() {
  const { login, isLoading } = useAuth()
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const nextErrors = {
      username: !username.trim() ? "نام کاربری الزامی است." : "",
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
      await login({ username: username.trim(), password })
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
          <AuthFormHeader
            logoClassName="size-24"
            title="پنل مدیریت"
            intro="برای ورود به پنل مدیریت، نام کاربری و رمز عبور خود را وارد کنید."
          />

          <AuthFormFields>
            <AuthFormField
              id="login-username"
              label="نام کاربری"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              dir="ltr"
              className="text-start"
              error={errors.username}
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
            />

            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}

            <Field>
              <Button
                type="submit"
                className={cn("w-full", authFormButtonClass)}
                disabled={isLoading}
              >
                {isLoading ? "در حال ورود..." : "ورود به پنل مدیریت"}
              </Button>
            </Field>
          </AuthFormFields>
        </FieldGroup>
      </form>
    </AuthFormShell>
  )
}
