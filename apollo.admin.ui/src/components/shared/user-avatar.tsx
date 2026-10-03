import * as React from "react"
import { UserIcon } from "lucide-react"

import { useAuthenticatedImageUrl } from "@/hooks/use-authenticated-image-url"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
  src?: string | null
  alt: string
  fallback: string
  className?: string
  fallbackClassName?: string
}

export function UserAvatar({
  src,
  alt,
  fallback,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const { displayUrl, failed } = useAuthenticatedImageUrl(src)
  const [imageFailed, setImageFailed] = React.useState(false)

  React.useEffect(() => {
    setImageFailed(false)
  }, [displayUrl])

  const showImage = Boolean(displayUrl) && !failed && !imageFailed

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted/30",
        className
      )}
    >
      {showImage ? (
        <img
          src={displayUrl!}
          alt={alt}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <>
          <span className="sr-only">{fallback}</span>
          <UserIcon
            className={cn(
              "size-[52%] text-muted-foreground",
              fallbackClassName
            )}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  )
}
