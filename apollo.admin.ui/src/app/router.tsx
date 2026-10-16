import { createBrowserRouter, Navigate } from "react-router-dom"

import { AppRoot } from "@/app/app-root"
import { ProtectedRoute } from "@/components/routing/protected-route"
import { AuthLayout } from "@/features/auth"
import { DashboardLayout } from "@/features/dashboard/components/dashboard-layout"
import { DashboardHomePage } from "@/features/dashboard/pages/dashboard-home-page"
import { PlansPage } from "@/features/dashboard/pages/plans-page"
import { PlanDetailsPage } from "@/features/dashboard/pages/plan-details-page"
import { SettingsPage } from "@/features/dashboard/pages/settings-page"
import { SmsPanelPage } from "@/features/dashboard/pages/sms-panel-page"
import { SitesPage } from "@/features/dashboard/pages/sites-page"
import { SupportPage } from "@/features/dashboard/pages/support-page"
import { UsersPage } from "@/features/dashboard/pages/users-page"

export const router = createBrowserRouter([
  {
    element: <AppRoot />,
    children: [
      {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
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
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "plans",
            element: <PlansPage />,
          },
          {
            path: "plans/:planId",
            element: <PlanDetailsPage />,
          },
          {
            path: "sites",
            element: <SitesPage />,
          },
          {
            path: "support",
            element: <SupportPage />,
          },
          {
            path: "sms-panel",
            element: <SmsPanelPage />,
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
