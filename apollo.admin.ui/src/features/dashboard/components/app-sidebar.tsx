import { NavLink, useLocation } from "react-router-dom"

import { BrandLogo } from "@/components/shared/brand-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { dashboardNavItems } from "@/features/dashboard/data/navigation"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const location = useLocation()
  const { setOpenMobile, isMobile, state } = useSidebar()
  const isCollapsed = state === "collapsed"

  function handleNavigate() {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar
      side="right"
      variant="sidebar"
      collapsible="icon"
      className="border-s border-white/[0.06]"
    >
      <SidebarHeader className="h-14 shrink-0 justify-center border-b border-border/60 px-3 py-0">
        <BrandLogo
          variant={isCollapsed ? "icon" : "full"}
          imageClassName={cn(
            "transition-all duration-200",
            isCollapsed ? "h-10 w-10" : "h-12 w-auto"
          )}
          className={cn(isCollapsed ? "justify-center" : "px-0.5")}
        />
      </SidebarHeader>

      <SidebarContent className="px-2.5 py-4">
        <SidebarGroup className="gap-2 p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {dashboardNavItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? location.pathname === "/dashboard"
                    : location.pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "relative h-9 gap-2.5 rounded-md px-2.5 text-xs font-light",
                        "text-muted-foreground transition-all duration-200",
                        "hover:bg-white/[0.04] hover:text-foreground",
                        "data-active:bg-primary/10 data-active:text-primary",
                        "data-active:hover:bg-primary/12 data-active:hover:text-primary",
                        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                      )}
                      render={
                        <NavLink
                          to={item.href}
                          onClick={handleNavigate}
                          end={item.href === "/dashboard"}
                        />
                      }
                    >
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-1.5 end-0 w-0.5 rounded-full bg-primary group-data-[collapsible=icon]:hidden"
                        />
                      ) : null}
                      <item.icon
                        className={cn(
                          "size-4 shrink-0 stroke-[1.5]",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/60 p-3 group-data-[collapsible=icon]:hidden">
        <p className="text-center text-[10px] font-light leading-5 text-muted-foreground/70">
          آپولو نسخه ۱.۰.۰۱
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
