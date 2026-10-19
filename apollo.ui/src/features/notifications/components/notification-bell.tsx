import * as React from "react"
import { BellIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/features/notifications/context/notification-provider"
import { cn } from "@/lib/utils"

const toolbarActionButtonClass = cn(
  "h-9 rounded border-white/10 bg-white/[0.04] shadow-none",
  "transition-all duration-200 ease-out",
  "hover:border-white/15 hover:bg-white/[0.07]"
)

function formatNotificationDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function NotificationBell() {
  const { unreadNotifications, unreadCount, isLoading, markAllAsRead } =
    useNotifications()
  const [open, setOpen] = React.useState(false)
  // Keep a snapshot while the menu is open so marking-as-read does not empty the list instantly.
  const [visibleNotifications, setVisibleNotifications] = React.useState(
    unreadNotifications
  )

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (nextOpen) {
      setVisibleNotifications(unreadNotifications)
      void markAllAsRead({ clearList: false })
      return
    }

    setVisibleNotifications([])
  }

  const itemsToShow = open ? visibleNotifications : unreadNotifications

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              toolbarActionButtonClass,
              "relative w-9 px-0 text-muted-foreground hover:text-foreground",
              "data-popup-open:border-white/15 data-popup-open:bg-white/[0.07] data-popup-open:text-foreground"
            )}
            aria-label="اعلان‌ها"
          />
        }
      >
        <BellIcon className="size-4" />
        {unreadCount > 0 ? (
          <span
            className={cn(
              "absolute -top-1 -start-1 flex min-w-4 h-4 items-center justify-center",
              "rounded-full bg-[#ff3b30] px-1 text-[9px] font-semibold leading-none text-white",
              "border-2 border-background shadow-[0_0_0_1px_rgba(255,59,48,0.35)]"
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "text-xs font-light",
          "w-80 rounded border border-white/10 bg-zinc-950/95 p-0 shadow-xl shadow-black/30 backdrop-blur-md",
          "origin-top duration-300 ease-out",
          "data-open:animate-none motion-safe:data-open:animate-toolbar-menu-in"
        )}
      >
        <div className="border-b border-white/10 px-3 py-2.5">
          <p className="text-xs font-light text-foreground">اعلان‌های جدید</p>
        </div>

        <ScrollArea className="max-h-80">
          {isLoading && itemsToShow.length === 0 ? (
            <p className="px-3 py-6 text-center text-muted-foreground">
              در حال بارگذاری...
            </p>
          ) : itemsToShow.length === 0 ? (
            <p className="px-3 py-6 text-center text-muted-foreground">
              اعلان جدیدی ندارید.
            </p>
          ) : (
            <ul className="divide-y divide-white/8">
              {itemsToShow.map((notification) => (
                <li
                  key={notification.id}
                  className="bg-primary/5 px-3 py-3 transition-colors"
                >
                  <p className="leading-6 text-foreground">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {formatNotificationDate(notification.createdAtUtc)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
