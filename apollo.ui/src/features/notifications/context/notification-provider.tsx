import * as React from "react"

import { notificationsApi } from "@/lib/api/notifications-api"
import type { AppNotification } from "@/lib/api/notifications-types"
import {
  createNotificationsHubConnection,
  startNotificationsHub,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from "@/lib/signalr/notifications-hub"
import { useAuth } from "@/features/auth"

type MarkAllAsReadOptions = {
  /** When false, badge clears but list stays until caller clears it (e.g. dropdown close). */
  clearList?: boolean
}

type NotificationContextValue = {
  unreadNotifications: AppNotification[]
  unreadCount: number
  isLoading: boolean
  markAllAsRead: (options?: MarkAllAsReadOptions) => Promise<void>
  refreshUnread: () => Promise<void>
}

const NotificationContext = React.createContext<NotificationContextValue | null>(
  null
)

function sortNotifications(items: AppNotification[]) {
  return [...items].sort(
    (left, right) =>
      new Date(right.createdAtUtc).getTime() -
      new Date(left.createdAtUtc).getTime()
  )
}

function upsertNotification(
  items: AppNotification[],
  notification: AppNotification
) {
  if (notification.isRead) {
    return items.filter((item) => item.id !== notification.id)
  }

  const next = items.filter((item) => item.id !== notification.id)
  next.unshift(notification)
  return sortNotifications(next)
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const [unreadNotifications, setUnreadNotifications] = React.useState<
    AppNotification[]
  >([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)

  const refreshUnread = React.useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadNotifications([])
      setUnreadCount(0)
      return
    }

    setIsLoading(true)

    try {
      const items = await notificationsApi.listUnread()
      const unread = await notificationsApi.getUnreadCount()

      setUnreadNotifications(sortNotifications(items))
      setUnreadCount(unread.count)
    } catch {
      setUnreadNotifications([])
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const markAllAsRead = React.useCallback(
    async (options?: MarkAllAsReadOptions) => {
      if (!isAuthenticated) {
        return
      }

      const clearList = options?.clearList !== false

      setUnreadCount(0)
      if (clearList) {
        setUnreadNotifications([])
      }

      await notificationsApi.markAllAsRead()
    },
    [isAuthenticated]
  )

  React.useEffect(() => {
    if (!isAuthenticated) {
      setUnreadNotifications([])
      setUnreadCount(0)
      return
    }

    void refreshUnread()
  }, [isAuthenticated, refreshUnread])

  React.useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const connection = createNotificationsHubConnection()

    const handleNotification = (notification: AppNotification) => {
      if (notification.isRead) {
        return
      }

      setUnreadNotifications((current) =>
        upsertNotification(current, notification)
      )
      setUnreadCount((current) => current + 1)
    }

    subscribeToNotifications(connection, handleNotification)

    void startNotificationsHub(connection).catch(() => {
      // REST fallback keeps notifications available if hub connection fails.
    })

    return () => {
      unsubscribeFromNotifications(connection)
      void connection.stop()
    }
  }, [isAuthenticated])

  const value = React.useMemo<NotificationContextValue>(
    () => ({
      unreadNotifications,
      unreadCount,
      isLoading,
      markAllAsRead,
      refreshUnread,
    }),
    [unreadNotifications, unreadCount, isLoading, markAllAsRead, refreshUnread]
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = React.useContext(NotificationContext)

  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }

  return context
}
