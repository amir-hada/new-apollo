"use client";

import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminHeader } from "@/components/layout/admin-header";
import { AdminMain } from "@/components/layout/admin-main";
import { AdminProfileDropdown } from "@/components/layout/admin-profile-dropdown";
import { AppSidebar } from "@/components/layout/admin-sidebar/app-sidebar";
import { PageTransition } from "@/components/layout/PageTransition";
import { ThemeSwitch } from "@/components/layout/theme-switch";

export function AdminShell({
  children,
  headerExtra,
  mainClassName,
  fixedMain,
  fluidMain,
}: {
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
  mainClassName?: string;
  fixedMain?: boolean;
  fluidMain?: boolean;
}) {
  return (
    <SidebarProvider defaultOpen className="min-h-svh bg-background">
      <AppSidebar />
      <SidebarInset
        className={cn(
          "@container/content bg-background md:border-r border-border",
          fixedMain && "h-svh min-h-0 overflow-hidden",
        )}
      >
        <AdminHeader fixed>
          {headerExtra}
          <div className="ms-auto flex items-center gap-2">
            <ThemeSwitch />
            <AdminProfileDropdown />
          </div>
        </AdminHeader>
        <AdminMain fixed={fixedMain} fluid={fluidMain} className={mainClassName}>
          <PageTransition className={cn(fixedMain && "flex min-h-0 flex-1 flex-col")}>
            {children}
          </PageTransition>
        </AdminMain>
      </SidebarInset>
    </SidebarProvider>
  );
}
