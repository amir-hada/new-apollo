import fullLogoUrl from "@/assets/full-logo.png"
import logoUrl from "@/assets/logo.png"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  withWordmark?: boolean
  variant?: "icon" | "full"
  className?: string
  logoClassName?: string
  wordmarkClassName?: string
}

export function BrandLogo({
  withWordmark = true,
  variant = "icon",
  className,
  logoClassName,
  wordmarkClassName,
}: BrandLogoProps) {
  const isFull = variant === "full"

  return (
    <a
      href="/"
      aria-label="آپولو — صفحه اصلی"
      className={cn("flex items-center gap-2", className)}
    >
      <img
        src={isFull ? fullLogoUrl : logoUrl}
        alt={isFull ? "آپولو" : ""}
        className={cn(
          isFull ? "h-10 w-auto object-contain" : "size-8",
          logoClassName
        )}
      />
      {withWordmark && !isFull ? (
        <span className={cn("font-heading text-lg font-bold", wordmarkClassName)}>
          آپولو
        </span>
      ) : null}
    </a>
  )
}
