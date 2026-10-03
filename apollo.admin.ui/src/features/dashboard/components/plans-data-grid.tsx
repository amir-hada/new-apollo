import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  LayersIcon,
  Loader2Icon,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PlanImage } from "@/features/dashboard/components/plan-image"
import { PlansFilterBar } from "@/features/dashboard/components/plans-filter-bar"
import { PlansPagination } from "@/features/dashboard/components/plans-pagination"
import { PlansRowActions } from "@/features/dashboard/components/plans-row-actions"
import { usePlansDataGrid } from "@/features/dashboard/hooks/use-plans-data-grid"
import type { AdminPlanListItem } from "@/lib/api/plan-types"
import { cn } from "@/lib/utils"

type PlansDataGridProps = {
  plans: AdminPlanListItem[]
  isLoading?: boolean
  error?: string | null
  onDelete: (plan: AdminPlanListItem) => void
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

function formatPrice(value: number) {
  return `${value.toLocaleString("fa-IR")} تومان`
}

function getBillingPeriodLabel(period: string) {
  switch (period) {
    case "Monthly":
      return "ماهانه"
    case "Yearly":
      return "سالانه"
    default:
      return period
  }
}

function AvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-md border px-2 py-0.5 text-[10px] font-light",
        isAvailable
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          : "border-destructive/25 bg-destructive/10 text-destructive"
      )}
    >
      {isAvailable ? "موجود" : "ناموجود"}
    </Badge>
  )
}

function InstallmentBadge({ allowsInstallment }: { allowsInstallment: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-md border px-2 py-0.5 text-[10px] font-light",
        allowsInstallment
          ? "border-primary/30 bg-primary/15 text-primary"
          : "border-white/10 bg-white/5 text-muted-foreground"
      )}
    >
      {allowsInstallment ? "اقساطی" : "نقدی"}
    </Badge>
  )
}

function BillingPeriodBadge({ billingPeriod }: { billingPeriod: string }) {
  return (
    <Badge
      variant="secondary"
      className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-light text-muted-foreground"
    >
      {getBillingPeriodLabel(billingPeriod)}
    </Badge>
  )
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-white/6">
          <td className="w-16 px-2 py-3 text-center">
            <Skeleton className="mx-auto size-10 rounded-md" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-3 w-24" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-3 w-28" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-3 w-24" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-5 w-14 rounded-md" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-5 w-14 rounded-md" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="mx-auto h-5 w-14 rounded-md" />
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

function PublishedBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-md border px-2 py-0.5 text-[10px] font-light",
        isPublished
          ? "border-sky-400/25 bg-sky-400/10 text-sky-300"
          : "border-white/10 bg-white/5 text-muted-foreground"
      )}
    >
      {isPublished ? "منتشر شده" : "پیش‌نویس"}
    </Badge>
  )
}

export function PlansDataGrid({
  plans,
  isLoading = false,
  error = null,
  onDelete,
}: PlansDataGridProps) {
  const {
    search,
    setSearch,
    availabilityFilter,
    setAvailabilityFilter,
    installmentFilter,
    setInstallmentFilter,
    billingPeriodFilter,
    setBillingPeriodFilter,
    sortDirection,
    toggleDateSort,
    page,
    setPage,
    pageSize,
    totalCount,
    totalPages,
    displayedPlans,
    isFiltering,
    hasActiveFilters,
    clearFilters,
  } = usePlansDataGrid(plans)

  const theadRef = React.useRef<HTMLTableSectionElement>(null)
  const [tbodyOverlayTop, setTbodyOverlayTop] = React.useState(0)

  React.useLayoutEffect(() => {
    if (!theadRef.current) return
    setTbodyOverlayTop(theadRef.current.offsetHeight)
  }, [isLoading, isFiltering, displayedPlans.length])

  return (
    <div className="grid gap-4">
      <PlansFilterBar
        search={search}
        onSearchChange={setSearch}
        availabilityFilter={availabilityFilter}
        onAvailabilityFilterChange={setAvailabilityFilter}
        installmentFilter={installmentFilter}
        onInstallmentFilterChange={setInstallmentFilter}
        billingPeriodFilter={billingPeriodFilter}
        onBillingPeriodFilterChange={setBillingPeriodFilter}
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

          <table className="plans-data-grid w-full min-w-[980px] border-collapse">
            <thead ref={theadRef}>
              <tr className="border-b border-white/8 bg-white/[0.02]">
                <th className="w-16 px-2 py-3 text-center" aria-hidden="true" />
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  نام پلن
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  قیمت
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  قیمت با تخفیف
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  موجودی
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  پرداخت
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  بازه
                </th>
                <th className="px-4 py-3 text-center text-xs font-light text-muted-foreground">
                  انتشار
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
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <p className="text-sm font-light text-destructive" role="alert">
                      {error}
                    </p>
                  </td>
                </tr>
              ) : displayedPlans.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                      <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-background/70 text-muted-foreground">
                        <LayersIcon className="size-5" />
                      </span>
                      <p className="text-sm font-light text-foreground">
                        پلنی یافت نشد
                      </p>
                      <p className="text-xs font-light text-muted-foreground">
                        {hasActiveFilters
                          ? "فیلترها را تغییر دهید یا جستجو را پاک کنید."
                          : "هنوز پلنی در سیستم ثبت نشده است."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedPlans.map((plan, index) => (
                  <tr
                    key={plan.planId}
                    className={cn(
                      "plans-grid-row border-b border-white/6 transition-colors last:border-b-0",
                      "hover:bg-primary/[0.04]",
                      index % 2 === 1 && "bg-white/[0.015]",
                      !plan.isAvailable && "opacity-70"
                    )}
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    <td className="w-16 px-2 py-3.5 text-center">
                      <div className="flex justify-center">
                        <PlanImage
                          src={plan.imageUrl}
                          alt={plan.name}
                          className="size-10"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Link
                        to={`/dashboard/plans/${plan.planId}`}
                        className="truncate text-sm font-light text-foreground transition-colors hover:text-primary"
                      >
                        {plan.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-center text-sm font-light tabular-nums text-foreground">
                      {formatPrice(plan.priceInToman)}
                    </td>
                    <td className="px-4 py-3.5 text-center text-sm font-light tabular-nums text-muted-foreground">
                      {plan.discountedPriceInToman
                        ? formatPrice(plan.discountedPriceInToman)
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <AvailabilityBadge isAvailable={plan.isAvailable} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <InstallmentBadge allowsInstallment={plan.allowsInstallment} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <BillingPeriodBadge billingPeriod={plan.billingPeriod} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <PublishedBadge isPublished={plan.isPublished} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-xs font-light tabular-nums text-muted-foreground">
                      {formatDate(plan.createdAtUtc)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <PlansRowActions plan={plan} onDelete={onDelete} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <PlansPagination
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
