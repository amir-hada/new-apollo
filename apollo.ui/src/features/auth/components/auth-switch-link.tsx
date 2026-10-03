import { useAuthView, type AuthView } from "@/features/auth/context/auth-view-context"
import { cn } from "@/lib/utils"

type AuthSwitchLinkProps = {
  view: AuthView
  children: React.ReactNode
  className?: string
}

export function AuthSwitchLink({
  view,
  children,
  className,
}: AuthSwitchLinkProps) {
  const { setView } = useAuthView()

  return (
    <button
      type="button"
      onClick={() => setView(view)}
      className={cn(
        "cursor-pointer font-light text-primary underline underline-offset-4 hover:text-primary/80",
        className
      )}
    >
      {children}
    </button>
  )
}
