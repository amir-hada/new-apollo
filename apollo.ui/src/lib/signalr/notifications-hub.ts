import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr"

import type { AppNotification } from "@/lib/api/notifications-types"
import { getAccessToken } from "@/lib/auth/session"

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5157"

function normalizeHubNotification(raw: unknown): AppNotification | null {
  if (!raw || typeof raw !== "object") return null
  const item = raw as Record<string, unknown>
  const id = String(item.id ?? item.Id ?? "")
  const message = String(item.message ?? item.Message ?? "")
  if (!id || !message) return null

  return {
    id,
    type: String(item.type ?? item.Type ?? ""),
    message,
    isRead: Boolean(item.isRead ?? item.IsRead ?? false),
    createdAtUtc: String(item.createdAtUtc ?? item.CreatedAtUtc ?? ""),
  }
}

export function createNotificationsHubConnection() {
  return new HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/notifications`, {
      accessTokenFactory: () => getAccessToken() ?? "",
    })
    .withAutomaticReconnect([0, 1000, 3000, 5000])
    .configureLogging(
      import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning
    )
    .build()
}

export async function startNotificationsHub(
  connection: HubConnection
): Promise<void> {
  if (connection.state === HubConnectionState.Connected) {
    return
  }

  if (connection.state === HubConnectionState.Connecting) {
    return
  }

  await connection.start()
}

export function subscribeToNotifications(
  connection: HubConnection,
  onNotification: (notification: AppNotification) => void
) {
  connection.on("ReceiveNotification", (payload: unknown) => {
    const normalized = normalizeHubNotification(payload)
    if (normalized) onNotification(normalized)
  })
}

export function unsubscribeFromNotifications(connection: HubConnection) {
  connection.off("ReceiveNotification")
}
