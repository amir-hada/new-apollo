import { cn } from "@/lib/utils"

import {
  authFormButtonClass,
  authPanelClass,
  authPanelRegisterClass,
} from "@/features/auth/lib/auth-form-styles"

type AuthFormShellProps = {
  children: React.ReactNode
  className?: string
  variant?: "login" | "register"
}

const cardVariants = {
  login: authPanelClass,
  register: authPanelRegisterClass,
}

export function AuthFormShell({
  children,
  className,
  variant = "login",
}: AuthFormShellProps) {
  return (
    <div
      className={cn(
        "rounded px-7 py-7",
        "[&_[data-slot=field-group]]:gap-6",
        "[&_[data-slot=button]]:h-10",
        authFormButtonClass,
        cardVariants[variant],
        className
      )}
    >
      {children}
    </div>
  )
}
