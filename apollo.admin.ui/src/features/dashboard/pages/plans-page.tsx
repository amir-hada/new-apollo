import * as React from "react"

import { DashboardFab } from "@/components/shared/dashboard-fab"
import { PlanCreateDialog } from "@/features/dashboard/components/plan-create-dialog"
import { PlansDataGrid } from "@/features/dashboard/components/plans-data-grid"
import { useAdminPlanActions } from "@/features/dashboard/hooks/use-admin-plan-actions"
import { useAuth } from "@/features/auth/context/auth-provider"
import { adminApi } from "@/lib/api/admin-api"
import type { AdminPlanListItem } from "@/lib/api/plan-types"
import { ApiError } from "@/lib/api/client"

export function PlansPage() {
  const { logout } = useAuth()
  const [plans, setPlans] = React.useState<AdminPlanListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  const loadPlans = React.useCallback(async () => {
    setIsLoading(true)

    try {
      const result = await adminApi.getPlans()
      setPlans(result)
      setError(null)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }

      setError(
        err instanceof Error ? err.message : "بارگذاری پلن‌ها ناموفق بود."
      )
    } finally {
      setIsLoading(false)
    }
  }, [logout])

  React.useEffect(() => {
    void loadPlans()
  }, [loadPlans])

  const { requestDelete, confirmDialog } = useAdminPlanActions({
    onSuccess: () => {
      void loadPlans()
    },
  })

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <PlansDataGrid
          plans={plans}
          isLoading={isLoading}
          error={error}
          onDelete={requestDelete}
        />
      </div>

      {!isCreateDialogOpen ? (
        <DashboardFab
          label="افزودن پلن جدید"
          onClick={() => setIsCreateDialogOpen(true)}
        />
      ) : null}

      <PlanCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          void loadPlans()
        }}
      />

      {confirmDialog}
    </>
  )
}
