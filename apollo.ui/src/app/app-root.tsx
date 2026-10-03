import { Outlet } from "react-router-dom"

import { AuthProvider } from "@/features/auth"
import { NotificationProvider } from "@/features/notifications/context/notification-provider"

export function AppRoot() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Outlet />
      </NotificationProvider>
    </AuthProvider>
  )
}
