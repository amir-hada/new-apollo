import { Outlet, useLocation } from "react-router-dom"

import { Toaster } from "@/components/ui/sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/dashboard/components/app-sidebar"
import { DashboardToolbar } from "@/features/dashboard/components/dashboard-toolbar"
import { cn } from "@/lib/utils"

export function DashboardLayout() {
  const location = useLocation()
  const isAssistantPage = location.pathname.startsWith("/dashboard/assistant")

  return (
    <SidebarProvider defaultOpen className="bg-background">
      <AppSidebar />
      <SidebarInset className="flex min-h-svh min-w-0 flex-col bg-background">
        <DashboardToolbar />
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            isAssistantPage ? "overflow-hidden p-0" : "p-5 sm:p-8"
          )}
        >
          <Outlet />
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
