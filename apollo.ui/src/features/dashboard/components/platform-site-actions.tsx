import * as React from "react"
import {
  ExternalLinkIcon,
  Loader2Icon,
  LogInIcon,
  RefreshCwIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/lib/api/client"
import { platformsApi } from "@/lib/api/platforms-api"
import type { SiteProvisioningStatus } from "@/lib/api/platform-types"
import { dashboardToast } from "@/lib/dashboard-toast"
import { cn } from "@/lib/utils"

const statusMeta: Record<
  SiteProvisioningStatus,
  { label: string; className: string }
> = {
  Pending: {
    label: "در حال آماده‌سازی",
    className: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  },
  Ready: {
    label: "آماده",
    className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  },
  Failed: {
    label: "ناموفق",
    className: "border-destructive/25 bg-destructive/10 text-destructive",
  },
}

export function ProvisioningStatusBadge({
  status,
}: {
  status: SiteProvisioningStatus
}) {
  const meta = statusMeta[status] ?? statusMeta.Pending

  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-md border px-2 py-0.5 text-[10px] font-light",
        meta.className
      )}
    >
      {meta.label}
    </Badge>
  )
}

type PlatformSiteActionsProps = {
  platformId: string
  status: SiteProvisioningStatus
  storefrontUrl: string | null
  /** Called after a successful retry so the parent can refresh data. */
  onChanged?: () => void
  className?: string
}

const buttonClass = "h-8 gap-1.5 rounded-lg border-white/10 px-2.5 text-xs font-light"

export function PlatformSiteActions({
  platformId,
  status,
  storefrontUrl,
  onChanged,
  className,
}: PlatformSiteActionsProps) {
  const [ssoLoading, setSsoLoading] = React.useState(false)
  const [retryLoading, setRetryLoading] = React.useState(false)

  async function handleEnterPanel() {
    setSsoLoading(true)
    try {
      const { redirectUrl } = await platformsApi.createShopSso(platformId)
      window.location.href = redirectUrl
    } catch (error) {
      dashboardToast.error(
        error instanceof ApiError
          ? error.message
          : "ورود به پنل فروشگاه ناموفق بود."
      )
      setSsoLoading(false)
    }
  }

  async function handleRetry() {
    setRetryLoading(true)
    try {
      await platformsApi.retryProvisioning(platformId)
      dashboardToast.success("درخواست راه‌اندازی مجدد ارسال شد.")
      onChanged?.()
    } catch (error) {
      dashboardToast.error(
        error instanceof ApiError
          ? error.message
          : "راه‌اندازی مجدد ناموفق بود."
      )
    } finally {
      setRetryLoading(false)
    }
  }

  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}
      onClick={(event) => event.stopPropagation()}
    >
      {storefrontUrl ? (
        <Button
          type="button"
          variant="outline"
          className={buttonClass}
          render={
            <a href={storefrontUrl} target="_blank" rel="noreferrer" />
          }
        >
          <ExternalLinkIcon className="size-3.5" />
          مشاهده فروشگاه
        </Button>
      ) : null}

      {status === "Ready" ? (
        <Button
          type="button"
          variant="outline"
          disabled={ssoLoading}
          className={cn(buttonClass, "text-primary hover:text-primary")}
          onClick={() => void handleEnterPanel()}
        >
          {ssoLoading ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <LogInIcon className="size-3.5" />
          )}
          ورود به پنل فروشگاه
        </Button>
      ) : null}

      {status === "Failed" ? (
        <Button
          type="button"
          variant="outline"
          disabled={retryLoading}
          className={cn(
            buttonClass,
            "text-amber-300 hover:bg-amber-400/10 hover:text-amber-300"
          )}
          onClick={() => void handleRetry()}
        >
          {retryLoading ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <RefreshCwIcon className="size-3.5" />
          )}
          تلاش مجدد
        </Button>
      ) : null}
    </div>
  )
}
