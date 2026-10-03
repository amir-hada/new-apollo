import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { notificationsApi } from "@/lib/api/notifications-api"
import type { AppNotification } from "@/lib/api/notifications-types"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

function formatNotificationDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function MessagesInboxPage() {
  const [page, setPage] = React.useState(1)
  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    []
  )
  const [totalPages, setTotalPages] = React.useState(0)
  const [totalCount, setTotalCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function loadPage() {
      setIsLoading(true)

      try {
        const result = await notificationsApi.listPaged(page, PAGE_SIZE)
        if (cancelled) return

        setNotifications(result.items ?? [])
        setTotalPages(result.totalPages ?? 0)
        setTotalCount(result.totalCount ?? 0)
      } catch {
        if (!cancelled) {
          setNotifications([])
          setTotalPages(0)
          setTotalCount(0)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadPage()

    return () => {
      cancelled = true
    }
  }, [page])

  return (
    <div className="grid w-full min-w-0 gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-light text-muted-foreground">
            {totalCount > 0
              ? `${totalCount.toLocaleString("fa-IR")} پیام`
              : "بدون پیام"}
          </p>
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded border-white/10 bg-transparent px-2.5 text-xs font-light"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
            >
              <ChevronRightIcon className="size-4" />
              قبلی
            </Button>
            <span className="min-w-16 text-center text-xs font-light text-muted-foreground">
              {page.toLocaleString("fa-IR")} /{" "}
              {totalPages.toLocaleString("fa-IR")}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded border-white/10 bg-transparent px-2.5 text-xs font-light"
              disabled={page >= totalPages || isLoading}
              onClick={() =>
                setPage((current) => Math.min(current + 1, totalPages))
              }
            >
              بعدی
              <ChevronLeftIcon className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded border border-white/10">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-16 text-xs font-light text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            در حال بارگذاری...
          </div>
        ) : (notifications ?? []).length === 0 ? (
          <p className="px-4 py-16 text-center text-xs font-light text-muted-foreground">
            هنوز پیامی دریافت نکرده‌اید.
          </p>
        ) : (
          <ul className="divide-y divide-white/8">
            {(notifications ?? []).map((notification) => (
              <li
                key={notification.id}
                className={cn(
                  "px-4 py-4 transition-colors",
                  !notification.isRead && "bg-primary/5"
                )}
              >
                <p className="text-xs font-light leading-6 text-foreground">
                  {notification.message}
                </p>
                <p className="mt-2 text-[11px] font-light text-muted-foreground">
                  {formatNotificationDate(notification.createdAtUtc)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
