import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const settingsTableHeaderClass =
  "px-4 py-3 text-start text-[11px] font-light text-muted-foreground"

export const settingsTableCellClass =
  "px-4 py-3 text-xs font-light text-foreground"

type SettingsDataGridColumn<T> = {
  key: string
  header: string
  headerClassName?: string
  cellClassName?: string
  cell: (row: T) => React.ReactNode
}

type SettingsDataGridProps<T> = {
  title?: string
  columns: SettingsDataGridColumn<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage: string
  getRowKey: (row: T) => string
  minWidth?: string
  skeletonRows?: number
}

export function SettingsDataGrid<T>({
  title,
  columns,
  data,
  isLoading = false,
  emptyMessage,
  getRowKey,
  minWidth = "640px",
  skeletonRows = 5,
}: SettingsDataGridProps<T>) {
  const contentKey = isLoading ? "loading" : data.length > 0 ? "data" : "empty"

  return (
    <section className="motion-safe:animate-settings-grid-in overflow-hidden rounded-2xl border border-white/10">
      {title ? (
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-xs font-light text-foreground">{title}</h2>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse"
          style={{ minWidth }}
        >
          <thead>
            <tr className="border-b border-white/10 bg-zinc-900/40">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(settingsTableHeaderClass, column.headerClassName)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            key={contentKey}
            className={cn(!isLoading && "settings-grid-rows-stagger")}
          >
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    className={cn(index % 2 === 1 && "bg-zinc-900/30")}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(settingsTableCellClass, column.cellClassName)}
                      >
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : null}

            {!isLoading && data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-xs font-light text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? data.map((row, index) => (
                  <tr
                    key={getRowKey(row)}
                    className={cn(
                      "border-b border-white/10 last:border-b-0",
                      index % 2 === 1 && "bg-zinc-900/30"
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(settingsTableCellClass, column.cellClassName)}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
