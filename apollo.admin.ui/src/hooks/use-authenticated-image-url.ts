import * as React from "react"

import {
  fetchAuthenticatedBlobUrl,
  isProtectedFileUrl,
} from "@/lib/api/files-api"
import { sanitizeProtectedFileUrl } from "@/lib/resolve-display-image-url"

export function useAuthenticatedImageUrl(url: string | null | undefined) {
  const cleanUrl = React.useMemo(() => sanitizeProtectedFileUrl(url), [url])
  const [displayUrl, setDisplayUrl] = React.useState<string | null>(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    setFailed(false)

    if (!cleanUrl) {
      setDisplayUrl(null)
      return
    }

    if (!isProtectedFileUrl(cleanUrl)) {
      setDisplayUrl(cleanUrl)
      return
    }

    let cancelled = false
    setDisplayUrl(null)

    void fetchAuthenticatedBlobUrl(cleanUrl).then((blobUrl) => {
      if (cancelled) return

      if (!blobUrl) {
        setFailed(true)
        setDisplayUrl(null)
        return
      }

      setDisplayUrl(blobUrl)
    })

    return () => {
      cancelled = true
    }
  }, [cleanUrl])

  return { displayUrl, failed }
}
