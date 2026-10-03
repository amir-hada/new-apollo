import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  Loader2Icon,
  UsersIcon,
} from "lucide-react"

import { UserAvatar } from "@/components/shared/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { UsersFilterBar } from "@/features/dashboard/components/users-filter-bar"
import { UsersPagination } from "@/features/dashboard/components/users-pagination"
import { UsersRowActions } from "@/features/dashboard/components/users-row-actions"
import { useUsersDataGrid } from "@/features/dashboard/hooks/use-users-data-grid"
import type { AdminUserListItem } from "@/lib/api/auth-types"
import { getUserInitials } from "@/lib/auth/user-display"
import { cn } from "@/lib/utils"

type UsersDataGridProps = {
  users: AdminUserListItem[]
  isLoading?: boolean
  error?: string | null
  currentUserId?: string
  onActivate: (user: AdminUserListItem) => void
  onDeactivate: (user: AdminUserListItem) => void
  onDelete: (user: AdminUserListItem) => void
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function getFullName(user: AdminUserListItem) {
  return `${user.firstName} ${user.lastName}`.trim() || "—"
}

function getRoleLabel(role: string) {
  switch (role) {
    case "Admin":
      return "مدیر سیستم"
    case "User":
      return "کاربر"
    default:
      return role
  }
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "Admin"

  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-md border px-2 py-0.5 text-[10px] font-light",
        isAdmin
          ? "border-primary/30 bg-primary/15 text-primary"
          : "border-white/10 bg-white/5 text-muted-foreground"
      )}
    >
      {getRoleLabel(role)}
    </Badge>
  )
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  const active = isActive !== false

  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-md border px-2 py-0.5 text-[10px] font-light",
        active
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : "border-destructive/25 bg-destructive/10 text-destructive"
      )}
    >
      {active ? "فعال" : "غیرفعال"}
    </Badge>
  )
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-white/6">
          <td className="w-16 px-2 py-3 text-center">
            <Skeleton className="mx-auto size-9 rounded-full" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-3 w-24" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-3 w-36" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-3 w-24" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-5 w-16 rounded-md" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-5 w-14 rounded-md" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-3 w-32" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto size-8 rounded-lg" />
          </td>
        </tr>
      ))}
    </>
  )
}

export function UsersDataGrid({
  users,
  isLoading = false,
  error = null,
  currentUserId,
  onActivate,
  onDeactivate,
  onDelete,
}: UsersDataGridProps) {
  const {
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    joinedFrom,
    setJoinedFrom,
    joinedTo,
    setJoinedTo,
    sortDirection,
    toggleDateSort,
    page,
    setPage,
    pageSize,
    totalCount,
    totalPages,
    displayedUsers,
    isFiltering,
    hasActiveFilters,
    clearFilters,
  } = useUsersDataGrid(users)

  const theadRef = React.useRef<HTMLTableSectionElement>(null)
  const [tbodyOverlayTop, setTbodyOverlayTop] = React.useState(0)

  React.useLayoutEffect(() => {
    if (!theadRef.current) return
    setTbodyOverlayTop(theadRef.current.offsetHeight)
  }, [isLoading, isFiltering, displayedUsers.length])

  return (
    <div className="grid gap-4">
      <UsersFilterBar
        search={search}
        onSearchChange={setSearch}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        joinedFrom={joinedFrom}
        onJoinedFromChange={setJoinedFrom}
        joinedTo={joinedTo}
        onJoinedToChange={setJoinedTo}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      <div className="overflow-hidden rounded-xl border border-white/10 bg-card/70 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
        {isLoading ? (
          <div className="flex items-center justify-end gap-1.5 border-b border-white/8 px-4 py-2.5 text-xs font-light text-muted-foreground">
            <Loader2Icon className="size-3.5 animate-spin" />
            در حال بارگذاری
          </div>
        ) : null}

        <div className="relative overflow-x-auto">
          {isFiltering ? (
            <div
              className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center bg-background/85 backdrop-blur-md"
              style={{ top: tbodyOverlayTop }}
            >
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-card/95 px-4 py-2 text-xs font-light text-muted-foreground shadow-lg">
                <Loader2Icon className="size-4 animate-spin text-primary" />
                در حال بارگذاری
              </div>
            </div>
          ) : null}

          <table className="users-data-grid w-full min-w-[960px] border-collapse">
            <thead ref={theadRef}>
              <tr className="border-b border-white/8 bg-white/[0.02]">
                <th className="w-16 px-2 py-3 text-center" aria-hidden="true" />
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  کاربر
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  نام کامل
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  ایمیل
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  موبایل
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  نقش
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  وضعیت
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={toggleDateSort}
                    className={cn(
                      "group inline-flex items-center justify-center gap-1.5 text-xs font-light transition-colors",
                      "text-primary"
                    )}
                  >
                    <span>تاریخ ایجاد</span>
                    <span className="inline-flex size-4 items-center justify-center rounded bg-primary/15">
                      {sortDirection === "asc" ? (
                        <ArrowUpIcon className="size-3" />
                      ) : (
                        <ArrowDownIcon className="size-3" />
                      )}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingRows />
              ) : error ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <p className="text-sm font-light text-destructive" role="alert">
                      {error}
                    </p>
                  </td>
                </tr>
              ) : displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-background/70 text-muted-foreground">
                        <UsersIcon className="size-5" />
                      </span>
                      <p className="text-sm font-light text-foreground">
                        کاربری یافت نشد
                      </p>
                      <p className="text-xs font-light text-muted-foreground">
                        {hasActiveFilters
                          ? "فیلترها را تغییر دهید یا جستجو را پاک کنید."
                          : "هنوز کاربری در سیستم ثبت نشده است."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user, index) => (
                  <tr
                    key={user.userId}
                    className={cn(
                      "users-grid-row border-b border-white/6 transition-colors last:border-b-0",
                      "hover:bg-primary/[0.04]",
                      index % 2 === 1 && "bg-white/[0.015]",
                      !user.isActive && user.isActive !== undefined && "opacity-70"
                    )}
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    <td className="w-16 px-2 py-3.5 text-center">
                      <div className="flex justify-center">
                        <UserAvatar
                          src={user.profilePictureUrl}
                          alt={user.username}
                          fallback={getUserInitials(user)}
                          className="size-9"
                          fallbackClassName="text-[10px]"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <p
                        dir="ltr"
                        className="truncate text-sm font-light text-foreground"
                      >
                        {user.username}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-center text-sm font-light text-foreground">
                      {getFullName(user)}
                    </td>
                    <td
                      dir="ltr"
                      className="px-4 py-3.5 text-center text-sm font-light text-muted-foreground"
                    >
                      {user.email || "—"}
                    </td>
                    <td
                      dir="ltr"
                      className="px-4 py-3.5 text-center text-sm font-light tabular-nums text-muted-foreground"
                    >
                      {user.mobileNumber || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <RoleBadge key={role} role={role} />
                          ))
                        ) : (
                          <span className="text-xs font-light text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge isActive={user.isActive} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs font-light tabular-nums text-muted-foreground">
                      {formatDate(user.createdAtUtc)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <UsersRowActions
                        user={user}
                        currentUserId={currentUserId}
                        onActivate={onActivate}
                        onDeactivate={onDeactivate}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <UsersPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setPage}
          disabled={isLoading || isFiltering}
        />
      </div>
    </div>
  )
}
