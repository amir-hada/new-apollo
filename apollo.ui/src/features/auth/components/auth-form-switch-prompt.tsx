import { FieldDescription } from "@/components/ui/field"
import { AuthSwitchLink } from "@/features/auth/components/auth-switch-link"
import { type AuthView } from "@/features/auth/context/auth-view-context"
import { cn } from "@/lib/utils"

type AuthFormSwitchPromptProps = {
  view: AuthView
  prompt: string
  linkLabel: string
  className?: string
}

export function AuthFormSwitchPrompt({
  view,
  prompt,
  linkLabel,
  className,
}: AuthFormSwitchPromptProps) {
  return (
    <FieldDescription
      className={cn(
        "text-center text-xs font-light text-muted-foreground",
        className
      )}
    >
      {prompt}{" "}
      <AuthSwitchLink view={view} className="text-xs font-light">
        {linkLabel}
      </AuthSwitchLink>
    </FieldDescription>
  )
}

export function LoginSwitchPrompt({
  className,
}: {
  className?: string
}) {
  return (
    <AuthFormSwitchPrompt
      view="register"
      prompt="حساب کاربری ندارید؟"
      linkLabel="ثبت نام کنید"
      className={className}
    />
  )
}

export function RegisterSwitchPrompt({
  className,
}: {
  className?: string
}) {
  return (
    <AuthFormSwitchPrompt
      view="login"
      prompt="حساب کاربری دارید؟"
      linkLabel="وارد شوید"
      className={className}
    />
  )
}
