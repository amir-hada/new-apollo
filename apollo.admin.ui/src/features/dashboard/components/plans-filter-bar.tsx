import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlansAvailabilityFilterDropdown } from "@/features/dashboard/components/plans-availability-filter-dropdown"
import { PlansBillingPeriodFilterDropdown } from "@/features/dashboard/components/plans-billing-period-filter-dropdown"
import { PlansInstallmentFilterDropdown } from "@/features/dashboard/components/plans-installment-filter-dropdown"
import type {
  AvailabilityFilter,
  BillingPeriodFilter,
  InstallmentFilter,
} from "@/features/dashboard/hooks/use-plans-data-grid"

type PlansFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  availabilityFilter: AvailabilityFilter
  onAvailabilityFilterChange: (value: AvailabilityFilter) => void
  installmentFilter: InstallmentFilter
  onInstallmentFilterChange: (value: InstallmentFilter) => void
  billingPeriodFilter: BillingPeriodFilter
  onBillingPeriodFilterChange: (value: BillingPeriodFilter) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function PlansFilterBar({
  search,
  onSearchChange,
  availabilityFilter,
  onAvailabilityFilterChange,
  installmentFilter,
  onInstallmentFilterChange,
  billingPeriodFilter,
  onBillingPeriodFilterChange,
  hasActiveFilters,
  onClearFilters,
}: PlansFilterBarProps) {
  return (
    <div className="plans-filter-bar rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
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

        <PlansAvailabilityFilterDropdown
          value={availabilityFilter}
          onChange={onAvailabilityFilterChange}
          className="min-w-0 flex-1"
        />

        <PlansInstallmentFilterDropdown
          value={installmentFilter}
          onChange={onInstallmentFilterChange}
          className="min-w-0 flex-1"
        />

        <PlansBillingPeriodFilterDropdown
          value={billingPeriodFilter}
          onChange={onBillingPeriodFilterChange}
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
