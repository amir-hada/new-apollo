import * as React from "react"
import { ExternalLinkIcon, GlobeIcon, Loader2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/features/auth/context/auth-provider"
import { adminApi } from "@/lib/api/admin-api"
import { ApiError } from "@/lib/api/client"
import { PLAN_PRODUCT_TYPE_LABELS } from "@/lib/api/plan-types"
import type {
  AdminSiteListItem,
  SiteProvisioningStatus,
} from "@/lib/api/site-types"
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

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function StatusBadge({ status }: { status: SiteProvisioningStatus }) {
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

function SiteLink({ href, label }: { href: string | null; label: string }) {
  if (!href) {
    return <span className="text-xs font-light text-muted-foreground">—</span>
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs font-light text-primary transition-opacity hover:opacity-80"
    >
      {label}
      <ExternalLinkIcon className="size-3" />
    </a>
  )
}

export function SitesPage() {
  const { logout } = useAuth()
  const [sites, setSites] = React.useState<AdminSiteListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const result = await adminApi.getSites()
        if (cancelled) return
        setSites(result)
        setError(null)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          logout()
          return
        }
        setError(
          err instanceof Error ? err.message : "بارگذاری سایت‌ها ناموفق بود."
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [logout])

  const headClass =
    "px-4 py-3 text-center text-xs font-light text-muted-foreground"

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-card/70 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
        {isLoading ? (
          <div className="flex items-center justify-end gap-1.5 border-b border-white/8 px-4 py-2.5 text-xs font-light text-muted-foreground">
            <Loader2Icon className="size-3.5 animate-spin" />
            در حال بارگذاری
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] border-collapse">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.02]">
                <th className={headClass}>کاربر</th>
                <th className={headClass}>پلن</th>
                <th className={headClass}>نام سایت</th>
                <th className={headClass}>اسلاگ</th>
                <th className={headClass}>وضعیت</th>
                <th className={headClass}>فروشگاه</th>
                <th className={headClass}>پنل مدیریت</th>
                <th className={headClass}>تاریخ ایجاد</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-white/6">
                    {Array.from({ length: 8 }).map((__, cell) => (
                      <td key={cell} className="px-4 py-3 text-center">
                        <Skeleton className="mx-auto h-3 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <p
                      className="text-sm font-light text-destructive"
                      role="alert"
                    >
                      {error}
                    </p>
                  </td>
                </tr>
              ) : sites.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-background/70 text-muted-foreground">
                        <GlobeIcon className="size-5" />
                      </span>
                      <p className="text-sm font-light text-foreground">
                        سایتی یافت نشد
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sites.map((site, index) => (
                  <tr
                    key={site.platformId}
                    className={cn(
                      "border-b border-white/6 transition-colors last:border-b-0 hover:bg-primary/[0.04]",
                      index % 2 === 1 && "bg-white/[0.015]"
                    )}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <p
                        dir="ltr"
                        className="text-sm font-light text-foreground"
                      >
                        {site.userEmail || site.userPhoneNumber || "—"}
                      </p>
                      {site.userFullName ? (
                        <p className="text-[11px] font-light text-muted-foreground">
                          {site.userFullName}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5 text-center text-sm font-light text-foreground">
                      {site.planName}
                      <p className="text-[11px] text-muted-foreground">
                        {PLAN_PRODUCT_TYPE_LABELS[site.productType]}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-center text-sm font-light text-foreground">
                      {site.name}
                    </td>
                    <td
                      dir="ltr"
                      className="px-4 py-3.5 text-center text-sm font-light text-muted-foreground"
                    >
                      {site.slug || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <StatusBadge status={site.provisioningStatus} />
                        {site.provisioningStatus === "Failed" &&
                        site.provisioningError ? (
                          <span
                            className="max-w-[180px] truncate text-[10px] font-light text-destructive"
                            title={site.provisioningError}
                          >
                            {site.provisioningError}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <SiteLink href={site.storefrontUrl} label="مشاهده" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <SiteLink href={site.adminUrl} label="پنل" />
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs font-light tabular-nums text-muted-foreground">
                      {formatDate(site.createdAtUtc)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
