import { Outlet } from "react-router-dom"

import { Toaster } from "@/components/ui/sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/features/dashboard/components/app-sidebar"
import { DashboardToolbar } from "@/features/dashboard/components/dashboard-toolbar"

export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen className="bg-background">
      <AppSidebar />
      <SidebarInset className="flex h-svh min-h-0 min-w-0 flex-col overflow-hidden bg-background">
        <DashboardToolbar />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5 sm:p-8">
          <Outlet />
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
