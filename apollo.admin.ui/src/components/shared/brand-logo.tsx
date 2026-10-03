import fullLogoUrl from "@/assets/full-logo.png"
import logoUrl from "@/assets/logo.png"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  className?: string
  imageClassName?: string
  variant?: "full" | "icon"
}

export function BrandLogo({
  className,
  imageClassName,
  variant = "full",
}: BrandLogoProps) {
  const src = variant === "icon" ? logoUrl : fullLogoUrl

  return (
    <a
      href="/dashboard"
      aria-label="آپولو — پنل مدیریت"
      className={cn("flex items-center justify-center", className)}
    >
      <img
        src={src}
        alt="آپولو"
        className={cn("max-w-full object-contain", imageClassName)}
      />
    </a>
  )
}
