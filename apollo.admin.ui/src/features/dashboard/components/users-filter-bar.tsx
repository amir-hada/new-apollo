import { SearchIcon, XIcon } from "lucide-react"

import { PersianDatePicker } from "@/components/shared/persian-date-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UsersRoleFilterDropdown } from "@/features/dashboard/components/users-role-filter-dropdown"
import { UsersStatusFilterDropdown } from "@/features/dashboard/components/users-status-filter-dropdown"
import type {
  RoleFilter,
  StatusFilter,
} from "@/features/dashboard/hooks/use-users-data-grid"

type UsersFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  roleFilter: RoleFilter
  onRoleFilterChange: (value: RoleFilter) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (value: StatusFilter) => void
  joinedFrom: string | null
  onJoinedFromChange: (value: string | null) => void
  joinedTo: string | null
  onJoinedToChange: (value: string | null) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function UsersFilterBar({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  joinedFrom,
  onJoinedFromChange,
  joinedTo,
  onJoinedToChange,
  hasActiveFilters,
  onClearFilters,
}: UsersFilterBarProps) {
  return (
    <div className="users-filter-bar rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex w-full items-center gap-2">
        <div className="relative min-w-0 flex-[1.6]">
          <SearchIcon className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="جستجو..."
            className="h-9 w-full rounded-lg border-white/10 bg-background/80 px-2 ps-8 text-center text-xs font-light shadow-none transition-all duration-200 placeholder:text-center placeholder:text-muted-foreground/80 hover:border-white/20 hover:bg-background focus-visible:border-primary/35 focus-visible:bg-primary/5 focus-visible:shadow-[0_0_0_1px_rgba(60,92,255,0.12)] focus-visible:ring-0 dark:bg-background/80"
          />
        </div>

        <UsersRoleFilterDropdown
          value={roleFilter}
          onChange={onRoleFilterChange}
          className="min-w-0 flex-1"
        />

        <UsersStatusFilterDropdown
          value={statusFilter}
          onChange={onStatusFilterChange}
          className="min-w-0 flex-1"
        />

        <PersianDatePicker
          value={joinedFrom}
          onChange={onJoinedFromChange}
          placeholder="از تاریخ"
          aria-label="از تاریخ عضویت"
          className="min-w-0 flex-1"
        />

        <PersianDatePicker
          value={joinedTo}
          onChange={onJoinedToChange}
          placeholder="تا تاریخ"
          aria-label="تا تاریخ عضویت"
          className="min-w-0 flex-1"
        />

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 rounded-lg px-2 text-xs font-light text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onClearFilters}
          >
            <XIcon data-icon="inline-start" />
            پاک کردن
          </Button>
        ) : null}
      </div>
    </div>
  )
}
