import * as React from "react"

import { SettingsDataGrid } from "@/features/dashboard/components/settings-data-grid"
import { authApi } from "@/lib/api/auth-api"
import type { LoginHistoryEntry } from "@/lib/api/auth-types"
import { cn } from "@/lib/utils"

function formatLoginDate(iso: string) {
  return new Date(iso).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

function formatLoginTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function LoginHistoryGrid() {
  const [entries, setEntries] = React.useState<LoginHistoryEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      setIsLoading(true)
      try {
        const history = await authApi.getLoginHistory(5)
        if (!cancelled) {
          setEntries(history)
        }
      } catch {
        if (!cancelled) {
          setEntries([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadHistory()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <SettingsDataGrid
      columns={[
        {
          key: "date",
          header: "تاریخ",
          cell: (entry) => formatLoginDate(entry.loggedInAtUtc),
        },
        {
          key: "time",
          header: "ساعت",
          cellClassName: "tabular-nums",
          cell: (entry) => formatLoginTime(entry.loggedInAtUtc),
        },
        {
          key: "ip",
          header: "آی‌پی",
          cellClassName: cn("font-mono text-[11px]"),
          cell: (entry) => (
            <span dir="ltr">{entry.ipAddress}</span>
          ),
        },
        {
          key: "device",
          header: "دستگاه",
          cell: (entry) => entry.device,
        },
      ]}
      data={entries}
      isLoading={isLoading}
      emptyMessage="هنوز لاگی ثبت نشده است."
      getRowKey={(entry) => entry.id}
    />
  )
}
