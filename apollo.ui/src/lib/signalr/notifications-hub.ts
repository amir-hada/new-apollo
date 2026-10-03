import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr"

import type { AppNotification } from "@/lib/api/notifications-types"
import { getAccessToken } from "@/lib/auth/session"

const API_URL = import.meta.env.VITE_API_URL ?? ""

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
  connection.on("ReceiveNotification", onNotification)
}

export function unsubscribeFromNotifications(connection: HubConnection) {
  connection.off("ReceiveNotification")
}
