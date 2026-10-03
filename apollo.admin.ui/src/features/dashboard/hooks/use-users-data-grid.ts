import * as React from "react"

import type { AdminUserListItem } from "@/lib/api/auth-types"
import {
  endOfDayTimestamp,
  parseIsoDate,
  startOfDayTimestamp,
} from "@/lib/jalali/jalali-date"

export type RoleFilter = "all" | "Admin" | "User"
export type StatusFilter = "all" | "active" | "inactive"

const DEFAULT_PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 350
const FILTER_LOADING_MS = 450

function getFullName(user: AdminUserListItem) {
  return `${user.firstName} ${user.lastName}`.trim()
}

function matchesSearch(user: AdminUserListItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const haystack = [
    user.username,
    user.email ?? "",
    user.mobileNumber ?? "",
    user.nationalId ?? "",
    getFullName(user),
    ...user.roles,
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(normalizedQuery)
}

function matchesStatus(user: AdminUserListItem, statusFilter: StatusFilter) {
  if (statusFilter === "all") return true

  const isActive = user.isActive !== false
  return statusFilter === "active" ? isActive : !isActive
}

function matchesJoinedDateRange(
  user: AdminUserListItem,
  joinedFrom: string | null,
  joinedTo: string | null
) {
  const createdAt = new Date(user.createdAtUtc).getTime()
  if (Number.isNaN(createdAt)) return true

  const fromDate = parseIsoDate(joinedFrom)
  const toDate = parseIsoDate(joinedTo)

  if (fromDate && createdAt < startOfDayTimestamp(fromDate)) {
    return false
  }

  if (toDate && createdAt > endOfDayTimestamp(toDate)) {
    return false
  }

  return true
}

export function useUsersDataGrid(
  users: AdminUserListItem[],
  pageSize = DEFAULT_PAGE_SIZE
) {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [joinedFrom, setJoinedFrom] = React.useState<string | null>(null)
  const [joinedTo, setJoinedTo] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "desc"
  )
  const [page, setPage] = React.useState(1)
  const [isFiltering, setIsFiltering] = React.useState(false)
  const [displayedUsers, setDisplayedUsers] = React.useState<
    AdminUserListItem[]
  >([])
  const isFirstFilterRender = React.useRef(true)

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [search])

  const filteredUsers = React.useMemo(
    () =>
      users.filter((user) => {
        if (roleFilter !== "all" && !user.roles.includes(roleFilter)) {
          return false
        }

        if (!matchesStatus(user, statusFilter)) {
          return false
        }

        if (!matchesJoinedDateRange(user, joinedFrom, joinedTo)) {
          return false
        }

        return matchesSearch(user, debouncedSearch)
      }),
    [users, roleFilter, statusFilter, joinedFrom, joinedTo, debouncedSearch]
  )

  const sortedUsers = React.useMemo(
    () =>
      [...filteredUsers].sort((left, right) => {
        const comparison =
          new Date(left.createdAtUtc).getTime() -
          new Date(right.createdAtUtc).getTime()

        return sortDirection === "asc" ? comparison : -comparison
      }),
    [filteredUsers, sortDirection]
  )

  const totalCount = sortedUsers.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(page, totalPages)

  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch, roleFilter, statusFilter, joinedFrom, joinedTo, sortDirection])

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const paginatedUsers = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sortedUsers.slice(start, start + pageSize)
  }, [safePage, pageSize, sortedUsers])

  const filterSignature = React.useMemo(
    () =>
      [
        debouncedSearch,
        roleFilter,
        statusFilter,
        joinedFrom ?? "",
        joinedTo ?? "",
        sortDirection,
        safePage,
        users.length,
      ].join("|"),
    [
      debouncedSearch,
      roleFilter,
      statusFilter,
      joinedFrom,
      joinedTo,
      sortDirection,
      safePage,
      users.length,
    ]
  )

  React.useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false
      setDisplayedUsers(paginatedUsers)
      return
    }

    setIsFiltering(true)

    const timer = window.setTimeout(() => {
      setDisplayedUsers(paginatedUsers)
      setIsFiltering(false)
    }, FILTER_LOADING_MS)

    return () => window.clearTimeout(timer)
  }, [filterSignature, paginatedUsers])

  const hasActiveFilters =
    search.trim().length > 0 ||
    roleFilter !== "all" ||
    statusFilter !== "all" ||
    joinedFrom !== null ||
    joinedTo !== null

  const isSearchPending = search !== debouncedSearch

  function clearFilters() {
    setSearch("")
    setDebouncedSearch("")
    setRoleFilter("all")
    setStatusFilter("all")
    setJoinedFrom(null)
    setJoinedTo(null)
    setPage(1)
  }

  function toggleDateSort() {
    setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
  }

  return {
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
    page: safePage,
    setPage,
    pageSize,
    totalCount,
    totalPages,
    displayedUsers,
    isFiltering: isFiltering || isSearchPending,
    hasActiveFilters,
    clearFilters,
  }
}
