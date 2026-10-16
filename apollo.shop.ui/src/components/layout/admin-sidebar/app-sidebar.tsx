"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { sidebarData } from "./sidebar-data";
import { TeamSwitcher } from "./team-switcher";
import type { NavGroup as NavGroupType, NavItem } from "./types";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const unread = useQuery({
    queryKey: ["admin-chat-unread"],
    queryFn: async () =>
      (await api.get<{ count: number }>("/api/admin/chats/unread-count")).data.count,
    refetchInterval: 30_000,
  });

  const navGroups = useMemo((): NavGroupType[] => {
    const count = unread.data ?? 0;
    return sidebarData.navGroups.map((group) => ({
      ...group,
      items: group.items.map((item): NavItem => {
        if ("url" in item && item.url === "/admin/chats") {
          return {
            ...item,
            badge: count > 0 ? toPersianDigits(String(count)) : undefined,
          };
        }
        return item;
      }),
    }));
  }, [unread.data]);

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "مدیر سیستم";

  return (
    <Sidebar collapsible="icon" side="right" variant="sidebar" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <Suspense fallback={null}>
          {navGroups.map((group) => (
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
