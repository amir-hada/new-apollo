import * as React from "react"

import {
  fetchAuthenticatedBlobUrl,
  isProtectedFileUrl,
} from "@/lib/api/files-api"

export function useAuthenticatedMediaUrl(url: string | null | undefined) {
  const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (!url) {
      setResolvedUrl(null)
      setIsLoading(false)
      return
    }

    if (!isProtectedFileUrl(url)) {
      setResolvedUrl(url)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    void fetchAuthenticatedBlobUrl(url).then((nextUrl) => {
      if (cancelled) return
      setResolvedUrl(nextUrl)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [url])

  return { url: resolvedUrl, isLoading }
}
