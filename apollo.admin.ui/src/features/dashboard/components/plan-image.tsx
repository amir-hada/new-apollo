import { ImageIcon } from "lucide-react"

import { useAuthenticatedImageUrl } from "@/hooks/use-authenticated-image-url"
import { cn } from "@/lib/utils"

type PlanImageProps = {
  src: string | null | undefined
  alt: string
  className?: string
}

export function PlanImage({ src, alt, className }: PlanImageProps) {
  const { displayUrl, failed } = useAuthenticatedImageUrl(src)

  if (!displayUrl || failed) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 text-muted-foreground",
          className
        )}
      >
        <ImageIcon className="size-4" />
        <span className="sr-only">{alt}</span>
      </span>
    )
  }

  return (
    <img
      src={displayUrl}
      alt={alt}
      className={cn(
        "rounded-md border border-white/10 object-cover",
        className
      )}
    />
  )
}
