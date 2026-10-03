import { cn } from "@/lib/utils"

type AuthFormFieldsProps = {
  children: React.ReactNode
  className?: string
}

export function AuthFormFields({ children, className }: AuthFormFieldsProps) {
  return (
    <div
      data-slot="auth-form-fields"
      className={cn(
        "mx-auto flex w-full max-w-full flex-col gap-5",
        className
      )}
    >
      {children}
    </div>
  )
}
