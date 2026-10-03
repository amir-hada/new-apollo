import * as React from "react"

import { DashboardFab } from "@/components/shared/dashboard-fab"
import { PlatformCreateDialog } from "@/features/dashboard/components/platform-create-dialog"
import { PlatformsDataGrid } from "@/features/dashboard/components/platforms-data-grid"
import { usePlatformActions } from "@/features/dashboard/hooks/use-platform-actions"
import { useAuth } from "@/features/auth"
import { ApiError } from "@/lib/api/client"
import { platformsApi } from "@/lib/api/platforms-api"
import type { UserPlatformListItem } from "@/lib/api/platform-types"

export function PlatformsPage() {
  const { logout } = useAuth()
  const [platforms, setPlatforms] = React.useState<UserPlatformListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  const loadPlatforms = React.useCallback(async () => {
    setIsLoading(true)

    try {
      const result = await platformsApi.getPlatforms()
      setPlatforms(result)
      setError(null)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }

      setError(
        err instanceof Error ? err.message : "بارگذاری پلتفرم‌ها ناموفق بود."
      )
    } finally {
      setIsLoading(false)
    }
  }, [logout])

  React.useEffect(() => {
    void loadPlatforms()
  }, [loadPlatforms])

  const { requestDelete, confirmDialog } = usePlatformActions({
    onSuccess: () => {
      void loadPlatforms()
    },
  })

  return (
    <>
      <PlatformsDataGrid
        platforms={platforms}
        isLoading={isLoading}
        error={error}
        onDelete={requestDelete}
      />

      {!isCreateDialogOpen ? (
        <DashboardFab
          label="افزودن پلتفرم جدید"
          onClick={() => setIsCreateDialogOpen(true)}
        />
      ) : null}

      <PlatformCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          void loadPlatforms()
        }}
      />

      {confirmDialog}
    </>
  )
}
