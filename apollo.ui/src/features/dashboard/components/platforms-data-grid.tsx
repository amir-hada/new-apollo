import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  LayersIcon,
  Loader2Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PlatformsFilterBar } from "@/features/dashboard/components/platforms-filter-bar"
import { PlatformsPagination } from "@/features/dashboard/components/platforms-pagination"
import { PlatformsRowActions } from "@/features/dashboard/components/platforms-row-actions"
import { usePlatformsDataGrid } from "@/features/dashboard/hooks/use-platforms-data-grid"
import type { UserPlatformListItem } from "@/lib/api/platform-types"
import { cn } from "@/lib/utils"

type PlatformsDataGridProps = {
  platforms: UserPlatformListItem[]
  isLoading?: boolean
  error?: string | null
  onDelete: (platform: UserPlatformListItem) => void
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

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-white/6">
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-3 w-28" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-3 w-24" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-3 w-24" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-7 w-16 rounded-md" />
          </td>
        </tr>
      ))}
    </>
  )
}

export function PlatformsDataGrid({
  platforms,
  isLoading = false,
  error = null,
  onDelete,
}: PlatformsDataGridProps) {
  const {
    search,
    setSearch,
    planFilter,
    setPlanFilter,
    planOptions,
    sortDirection,
    toggleDateSort,
    page,
    setPage,
    pageSize,
    totalCount,
    totalPages,
    displayedPlatforms,
    isFiltering,
    hasActiveFilters,
    clearFilters,
  } = usePlatformsDataGrid(platforms)

  const theadRef = React.useRef<HTMLTableSectionElement>(null)
  const [tbodyOverlayTop, setTbodyOverlayTop] = React.useState(0)

  React.useLayoutEffect(() => {
    if (!theadRef.current) return
    setTbodyOverlayTop(theadRef.current.offsetHeight)
  }, [isLoading, isFiltering, displayedPlatforms.length])

  return (
    <div className="grid gap-4">
      <PlatformsFilterBar
        search={search}
        onSearchChange={setSearch}
        planFilter={planFilter}
        onPlanFilterChange={setPlanFilter}
        planOptions={planOptions}
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

          <table className="w-full min-w-[720px] border-collapse">
            <thead ref={theadRef}>
              <tr className="border-b border-white/8 bg-white/[0.02]">
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  نام پلتفرم
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  پلن
                </th>
                <th className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={toggleDateSort}
                    className="group inline-flex items-center justify-center gap-1.5 text-xs font-light text-primary transition-colors"
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
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <p className="text-sm font-light text-destructive" role="alert">
                      {error}
                    </p>
                  </td>
                </tr>
              ) : displayedPlatforms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-background/70 text-muted-foreground">
                        <LayersIcon className="size-5" />
                      </span>
                      <p className="text-sm font-light text-foreground">
                        پلتفرمی یافت نشد
                      </p>
                      <p className="text-xs font-light text-muted-foreground">
                        {hasActiveFilters
                          ? "فیلترها را تغییر دهید یا جستجو را پاک کنید."
                          : "هنوز پلتفرمی نساخته‌اید."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedPlatforms.map((platform, index) => (
                  <tr
                    key={platform.platformId}
                    className={cn(
                      "border-b border-white/6 transition-colors last:border-b-0",
                      "hover:bg-primary/[0.04]",
                      index % 2 === 1 && "bg-white/[0.015]"
                    )}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <p className="truncate text-sm font-light text-foreground">
                        {platform.name}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant="secondary"
                        className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-light text-primary"
                      >
                        {platform.planName}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs font-light tabular-nums text-muted-foreground">
                      {formatDate(platform.createdAtUtc)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <PlatformsRowActions
                        platform={platform}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PlatformsPagination
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
