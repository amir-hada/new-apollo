import { Link, useLocation } from "react-router-dom"
import {
  ChevronDownIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react"

import { UserAvatar } from "@/components/shared/user-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/features/auth/context/auth-provider"
import { getUserDisplayName, getUserInitials } from "@/lib/auth/user-display"
import { resolveDashboardPageTitle } from "@/features/dashboard/data/navigation"
import { cn } from "@/lib/utils"

const userMenuTextClass = "text-xs font-light"

const userMenuItemClass = cn(
  userMenuTextClass,
  "whitespace-normal rounded transition-colors duration-200 ease-out",
  "hover:bg-white/6 focus:bg-white/6",
  "motion-safe:animate-toolbar-menu-item-in"
)

export function DashboardToolbar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const pageTitle = resolveDashboardPageTitle(location.pathname)

  if (!user) {
    return null
  }

  const displayName = getUserDisplayName(user)
  const initials = getUserInitials(user)

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/60 bg-sidebar px-4 sm:px-6">
      <SidebarTrigger
        className="text-muted-foreground"
        aria-label="باز و بسته کردن منو"
      />

      <h1 className="truncate text-sm font-light text-foreground">{pageTitle}</h1>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className={cn(
                  userMenuTextClass,
                  "group/user-menu h-9 gap-2 rounded border-white/10 bg-white/[0.04] px-2.5 shadow-none",
                  "transition-all duration-200 ease-out",
                  "text-foreground hover:border-white/15 hover:bg-white/[0.07] hover:text-foreground",
                  "data-popup-open:border-white/15 data-popup-open:bg-white/[0.07]"
                )}
                aria-label="منوی حساب کاربری"
              />
            }
          >
            <UserAvatar
              src={user.profilePictureUrl}
              alt={displayName}
              fallback={initials}
              className="size-7 shrink-0"
              fallbackClassName="text-[11px]"
            />
            <span className={cn(userMenuTextClass, "max-w-32 truncate")}>
              {displayName}
            </span>
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-data-popup-open/user-menu:rotate-180" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className={cn(
              userMenuTextClass,
              "min-w-(--anchor-width) w-(--anchor-width) rounded border border-white/10 bg-zinc-950/95 p-1.5 shadow-xl shadow-black/30 backdrop-blur-md",
              "origin-top duration-300 ease-out",
              "data-open:animate-none motion-safe:data-open:animate-toolbar-menu-in",
              "data-closed:animate-none motion-safe:data-closed:animate-out motion-safe:data-closed:fade-out-0 motion-safe:data-closed:zoom-out-95 motion-safe:data-closed:duration-200"
            )}
          >
            <DropdownMenuItem
              className={userMenuItemClass}
              style={{ animationDelay: "40ms" }}
              render={<Link to="/dashboard/settings" />}
            >
              <SettingsIcon />
              تنظیمات
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-white/8" />
            <DropdownMenuItem
              variant="destructive"
              className={cn(
                userMenuItemClass,
                "hover:bg-destructive/10 focus:bg-destructive/10"
              )}
              style={{ animationDelay: "100ms" }}
              onClick={logout}
            >
              <LogOutIcon />
              خروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
