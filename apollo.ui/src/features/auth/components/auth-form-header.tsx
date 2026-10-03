import { Link } from "react-router-dom"

import { BrandLogo } from "@/components/shared/brand-logo"
import { FieldDescription } from "@/components/ui/field"
import { cn } from "@/lib/utils"

type AuthFormHeaderProps = {
  title?: string
  intro?: string
  description?: React.ReactNode
  logoClassName?: string
  className?: string
}

export function AuthFormHeader({
  title,
  intro,
  description,
  logoClassName = "size-16",
  className,
}: AuthFormHeaderProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 pb-2 text-center", className)}>
      <Link
        to="/"
        className="mb-1 flex flex-col items-center gap-2.5 font-medium transition-opacity hover:opacity-80"
      >
        <BrandLogo withWordmark={false} logoClassName={logoClassName} />
        <span className="sr-only">آپولو</span>
      </Link>
      {title ? (
        <h1 className="font-heading text-lg font-light">{title}</h1>
      ) : (
        <h1 className="sr-only">ورود به سیستم</h1>
      )}
      {intro ? (
        <FieldDescription className="max-w-xs text-center text-xs leading-relaxed font-light text-muted-foreground">
          {intro}
        </FieldDescription>
      ) : null}
      {description ? (
        <FieldDescription className="text-center">{description}</FieldDescription>
      ) : null}
    </div>
  )
}
