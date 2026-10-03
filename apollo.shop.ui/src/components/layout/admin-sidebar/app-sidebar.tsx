"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/auth-store";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { sidebarData } from "./sidebar-data";
import { TeamSwitcher } from "./team-switcher";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "مدیر سیستم";

  return (
    <Sidebar collapsible="icon" side="right" variant="sidebar" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <Suspense fallback={null}>
          {sidebarData.navGroups.map((group) => (
            <NavGroup key={group.title} {...group} />
          ))}
        </Suspense>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: displayName,
            email: user?.email || "admin@apolloshop.ir",
            avatar: user?.avatarUrl || "",
          }}
          onLogout={() => {
            clearSession();
            router.push("/login");
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
