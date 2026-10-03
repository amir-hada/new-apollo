import * as React from "react"

import type { AdminPlanListItem, PlanBillingPeriod } from "@/lib/api/plan-types"

export type AvailabilityFilter = "all" | "available" | "unavailable"
export type InstallmentFilter = "all" | "yes" | "no"
export type BillingPeriodFilter = "all" | PlanBillingPeriod

const DEFAULT_PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 350
const FILTER_LOADING_MS = 450

function matchesSearch(plan: AdminPlanListItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const haystack = [
    plan.name,
    plan.description,
    ...plan.properties.map((property) => `${property.title} ${property.value}`),
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(normalizedQuery)
}

function matchesAvailability(
  plan: AdminPlanListItem,
  availabilityFilter: AvailabilityFilter
) {
  if (availabilityFilter === "all") return true
  return availabilityFilter === "available" ? plan.isAvailable : !plan.isAvailable
}

function matchesInstallment(
  plan: AdminPlanListItem,
  installmentFilter: InstallmentFilter
) {
  if (installmentFilter === "all") return true
  return installmentFilter === "yes"
    ? plan.allowsInstallment
    : !plan.allowsInstallment
}

function matchesBillingPeriod(
  plan: AdminPlanListItem,
  billingPeriodFilter: BillingPeriodFilter
) {
  if (billingPeriodFilter === "all") return true
  return plan.billingPeriod === billingPeriodFilter
}

export function usePlansDataGrid(
  plans: AdminPlanListItem[],
  pageSize = DEFAULT_PAGE_SIZE
) {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [availabilityFilter, setAvailabilityFilter] =
    React.useState<AvailabilityFilter>("all")
  const [installmentFilter, setInstallmentFilter] =
    React.useState<InstallmentFilter>("all")
  const [billingPeriodFilter, setBillingPeriodFilter] =
    React.useState<BillingPeriodFilter>("all")
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  )
  const [page, setPage] = React.useState(1)
  const [isFiltering, setIsFiltering] = React.useState(false)
  const [displayedPlans, setDisplayedPlans] = React.useState<
    AdminPlanListItem[]
  >([])
  const isFirstFilterRender = React.useRef(true)

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [search])

  const filteredPlans = React.useMemo(
    () =>
      plans.filter((plan) => {
        if (!matchesAvailability(plan, availabilityFilter)) return false
        if (!matchesInstallment(plan, installmentFilter)) return false
        if (!matchesBillingPeriod(plan, billingPeriodFilter)) return false
        return matchesSearch(plan, debouncedSearch)
      }),
    [
      plans,
      availabilityFilter,
      installmentFilter,
      billingPeriodFilter,
      debouncedSearch,
    ]
  )

  const sortedPlans = React.useMemo(
    () =>
      [...filteredPlans].sort((left, right) => {
        const comparison =
          new Date(left.createdAtUtc).getTime() -
          new Date(right.createdAtUtc).getTime()

        return sortDirection === "asc" ? comparison : -comparison
      }),
    [filteredPlans, sortDirection]
  )

  const totalCount = sortedPlans.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(page, totalPages)

  React.useEffect(() => {
    setPage(1)
  }, [
    debouncedSearch,
    availabilityFilter,
    installmentFilter,
    billingPeriodFilter,
    sortDirection,
  ])

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const paginatedPlans = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sortedPlans.slice(start, start + pageSize)
  }, [safePage, pageSize, sortedPlans])

  const filterSignature = React.useMemo(
    () =>
      [
        debouncedSearch,
        availabilityFilter,
        installmentFilter,
        billingPeriodFilter,
        sortDirection,
        safePage,
        plans.length,
      ].join("|"),
    [
      debouncedSearch,
      availabilityFilter,
      installmentFilter,
      billingPeriodFilter,
      sortDirection,
      safePage,
      plans.length,
    ]
  )

  React.useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false
      setDisplayedPlans(paginatedPlans)
      return
    }

    setIsFiltering(true)

    const timer = window.setTimeout(() => {
      setDisplayedPlans(paginatedPlans)
      setIsFiltering(false)
    }, FILTER_LOADING_MS)

    return () => window.clearTimeout(timer)
  }, [filterSignature, paginatedPlans])

  const hasActiveFilters =
    search.trim().length > 0 ||
    availabilityFilter !== "all" ||
    installmentFilter !== "all" ||
    billingPeriodFilter !== "all"

  const isSearchPending = search !== debouncedSearch

  function clearFilters() {
    setSearch("")
    setDebouncedSearch("")
    setAvailabilityFilter("all")
    setInstallmentFilter("all")
    setBillingPeriodFilter("all")
    setPage(1)
  }

  function toggleDateSort() {
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
  }

  return {
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
    page: safePage,
    setPage,
    pageSize,
    totalCount,
    totalPages,
    displayedPlans,
    isFiltering: isFiltering || isSearchPending,
    hasActiveFilters,
    clearFilters,
  }
}
