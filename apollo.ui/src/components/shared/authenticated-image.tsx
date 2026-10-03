import { useAuthenticatedMediaUrl } from "@/hooks/use-authenticated-media-url"
import { cn } from "@/lib/utils"

type AuthenticatedImageProps = {
  src?: string | null
  alt: string
  className?: string
  fallback?: React.ReactNode
}

export function AuthenticatedImage({
  src,
  alt,
  className,
  fallback = null,
}: AuthenticatedImageProps) {
  const { url, isLoading } = useAuthenticatedMediaUrl(src)

  if (!src) {
    return fallback
  }

  if (!url) {
    return (
      <>
        {fallback}
        {isLoading ? (
          <span className="sr-only" aria-live="polite">
            در حال بارگذاری تصویر
          </span>
        ) : null}
      </>
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      className={cn("object-cover", className)}
      loading="lazy"
      decoding="async"
    />
  )
}
