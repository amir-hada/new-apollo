import * as React from "react"

import type { UserPlatformListItem } from "@/lib/api/platform-types"

const DEFAULT_PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 350
const FILTER_LOADING_MS = 450

function matchesSearch(platform: UserPlatformListItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const haystack = [
    platform.name,
    platform.planName,
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(normalizedQuery)
}

export function usePlatformsDataGrid(
  platforms: UserPlatformListItem[],
  pageSize = DEFAULT_PAGE_SIZE
) {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [planFilter, setPlanFilter] = React.useState<string>("all")
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  )
  const [page, setPage] = React.useState(1)
  const [isFiltering, setIsFiltering] = React.useState(false)
  const [displayedPlatforms, setDisplayedPlatforms] = React.useState<
    UserPlatformListItem[]
  >([])
  const isFirstFilterRender = React.useRef(true)

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [search])

  const planOptions = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const platform of platforms) {
      map.set(platform.planId, platform.planName)
    }
    return [...map.entries()].map(([value, label]) => ({ value, label }))
  }, [platforms])

  const filteredPlatforms = React.useMemo(
    () =>
      platforms.filter((platform) => {
        if (planFilter !== "all" && platform.planId !== planFilter) return false
        return matchesSearch(platform, debouncedSearch)
      }),
    [platforms, planFilter, debouncedSearch]
  )

  const sortedPlatforms = React.useMemo(
    () =>
      [...filteredPlatforms].sort((left, right) => {
        const comparison =
          new Date(left.createdAtUtc).getTime() -
          new Date(right.createdAtUtc).getTime()

        return sortDirection === "asc" ? comparison : -comparison
      }),
    [filteredPlatforms, sortDirection]
  )

  const totalCount = sortedPlatforms.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(page, totalPages)

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, planFilter, sortDirection])

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const paginatedPlatforms = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sortedPlatforms.slice(start, start + pageSize)
  }, [safePage, pageSize, sortedPlatforms])

  const filterSignature = React.useMemo(
    () =>
      [
        debouncedSearch,
        planFilter,
        sortDirection,
        safePage,
        platforms.length,
      ].join("|"),
    [debouncedSearch, planFilter, sortDirection, safePage, platforms.length]
  )

  React.useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false
      setDisplayedPlatforms(paginatedPlatforms)
      return
    }

    setIsFiltering(true)

    const timer = window.setTimeout(() => {
      setDisplayedPlatforms(paginatedPlatforms)
      setIsFiltering(false)
    }, FILTER_LOADING_MS)

    return () => window.clearTimeout(timer)
  }, [filterSignature, paginatedPlatforms])

  const hasActiveFilters =
    search.trim().length > 0 || planFilter !== "all"

  const isSearchPending = search !== debouncedSearch

  function clearFilters() {
    setSearch("")
    setDebouncedSearch("")
    setPlanFilter("all")
    setPage(1)
  }

  function toggleDateSort() {
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
  }

  return {
    search,
    setSearch,
    planFilter,
    setPlanFilter,
    planOptions,
    sortDirection,
    toggleDateSort,
    page: safePage,
    setPage,
    pageSize,
    totalCount,
    totalPages,
    displayedPlatforms,
    isFiltering: isFiltering || isSearchPending,
    hasActiveFilters,
    clearFilters,
  }
}
