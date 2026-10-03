import { createBrowserRouter, Navigate } from "react-router-dom"

import { AppRoot } from "@/app/app-root"
import { ProtectedRoute } from "@/components/routing/protected-route"
import { AuthLayout } from "@/features/auth"
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout"
import { DashboardHomePage } from "@/features/dashboard/pages/dashboard-home-page"
import { MessagesInboxPage } from "@/features/dashboard/pages/messages-inbox-page"
import { OrdersPage } from "@/features/dashboard/pages/orders-page"
import { PlatformsPage } from "@/features/dashboard/pages/platforms-page"
import { PlatformDetailsPage } from "@/features/dashboard/pages/platform-details-page"
import { SmartAssistantPage } from "@/features/dashboard/pages/smart-assistant-page"
import { SettingsPage } from "@/features/dashboard/pages/settings-page"
import { SupportPage } from "@/features/dashboard/pages/support-page"
import { LandingPage } from "@/features/landing"

export const router = createBrowserRouter([
  {
    element: <AppRoot />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/auth",
        element: <AuthLayout />,
      },
      {
        path: "/auth/*",
        element: <Navigate to="/auth" replace />,
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardHomePage />,
          },
          {
            path: "platforms",
            element: <PlatformsPage />,
          },
          {
            path: "platforms/:platformId",
            element: <PlatformDetailsPage />,
          },
          {
            path: "assistant",
            element: <SmartAssistantPage />,
          },
          {
            path: "messages",
            element: <MessagesInboxPage />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
          },
          {
            path: "support",
            element: <SupportPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
])
