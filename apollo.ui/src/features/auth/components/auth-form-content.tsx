import { cn } from "@/lib/utils"

type AuthFormContentProps = {
  children: React.ReactNode
  className?: string
}

export function AuthFormContent({ children, className }: AuthFormContentProps) {
  return (
    <div
      data-slot="auth-fields"
      className={cn("mx-auto flex w-full max-w-[17.5rem] flex-col gap-5", className)}
    >
      {children}
    </div>
  )
}
