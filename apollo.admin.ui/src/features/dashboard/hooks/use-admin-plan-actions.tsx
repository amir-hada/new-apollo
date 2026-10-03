import * as React from "react"

import { DestructiveConfirmDialog } from "@/components/shared/destructive-confirm-dialog"
import { adminApi } from "@/lib/api/admin-api"
import type { AdminPlanListItem } from "@/lib/api/plan-types"
import { ApiError } from "@/lib/api/client"
import { dashboardToast } from "@/lib/dashboard-toast"
import { Trash2Icon } from "lucide-react"

type UseAdminPlanActionsOptions = {
  onSuccess: () => void
}

export function useAdminPlanActions({ onSuccess }: UseAdminPlanActionsOptions) {
  const [pendingPlan, setPendingPlan] =
    React.useState<AdminPlanListItem | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function requestDelete(plan: AdminPlanListItem) {
    setPendingPlan(plan)
  }

  function cancelAction() {
    if (isSubmitting) return
    setPendingPlan(null)
  }

  async function confirmAction() {
    if (!pendingPlan) return

    setIsSubmitting(true)

    try {
      await adminApi.deletePlan(pendingPlan.planId)
      dashboardToast.success("پلن با موفقیت حذف شد.")
      setPendingPlan(null)
      onSuccess()
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "عملیات انجام نشد. دوباره تلاش کنید."
      dashboardToast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDialog = (
    <DestructiveConfirmDialog
      open={pendingPlan !== null}
      loading={isSubmitting}
      icon={Trash2Icon}
      title="حذف پلن"
      description={
        pendingPlan
          ? `آیا از حذف پلن «${pendingPlan.name}» اطمینان دارید؟ این عملیات قابل بازگشت نیست.`
          : ""
      }
      confirmLabel="حذف پلن"
      onCancel={cancelAction}
      onConfirm={() => void confirmAction()}
    />
  )

  return {
    requestDelete,
    confirmDialog,
  }
}
