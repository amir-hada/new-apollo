import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type UsersPaginationProps = {
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

function getVisiblePages(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, page])

  if (page > 1) pages.add(page - 1)
  if (page < totalPages) pages.add(page + 1)

  return [...pages].sort((left, right) => left - right)
}

export function UsersPagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  disabled = false,
}: UsersPaginationProps) {
  if (totalCount === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)
  const visiblePages = getVisiblePages(page, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-white/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-light text-muted-foreground">
        نمایش{" "}
        <span className="text-foreground">
          {start.toLocaleString("fa-IR")}–{end.toLocaleString("fa-IR")}
        </span>{" "}
        از{" "}
        <span className="text-foreground">
          {totalCount.toLocaleString("fa-IR")}
        </span>{" "}
        کاربر
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-lg border-white/10 bg-transparent"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(1)}
          aria-label="صفحه اول"
        >
          <ChevronsRightIcon />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-lg border-white/10 bg-transparent"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="صفحه قبلی"
        >
          <ChevronRightIcon />
        </Button>

        <div className="mx-1 flex items-center gap-1">
          {visiblePages.map((pageNumber, index) => {
            const previous = visiblePages[index - 1]
            const showEllipsis = previous !== undefined && pageNumber - previous > 1

            return (
              <React.Fragment key={pageNumber}>
                {showEllipsis ? (
                  <span className="px-1 text-xs font-light text-muted-foreground">
                    ...
                  </span>
                ) : null}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPageChange(pageNumber)}
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-lg border text-xs font-light transition-colors",
                    pageNumber === page
                      ? "border-primary/40 bg-primary text-primary-foreground"
                      : "border-white/10 bg-transparent text-muted-foreground hover:border-white/20 hover:text-foreground"
                  )}
                >
                  {pageNumber.toLocaleString("fa-IR")}
                </button>
              </React.Fragment>
            )
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-lg border-white/10 bg-transparent"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="صفحه بعدی"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-lg border-white/10 bg-transparent"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="صفحه آخر"
        >
          <ChevronsLeftIcon />
        </Button>
      </div>
    </div>
  )
}
