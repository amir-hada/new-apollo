import * as React from "react"
import { Trash2Icon } from "lucide-react"

import { DestructiveConfirmDialog } from "@/components/shared/destructive-confirm-dialog"
import { platformsApi } from "@/lib/api/platforms-api"
import type { UserPlatformListItem } from "@/lib/api/platform-types"
import { ApiError } from "@/lib/api/client"
import { dashboardToast } from "@/lib/dashboard-toast"

type UsePlatformActionsOptions = {
  onSuccess: () => void
}

export function usePlatformActions({ onSuccess }: UsePlatformActionsOptions) {
  const [pendingPlatform, setPendingPlatform] =
    React.useState<UserPlatformListItem | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function requestDelete(platform: UserPlatformListItem) {
    setPendingPlatform(platform)
  }

  function cancelAction() {
    if (isSubmitting) return
    setPendingPlatform(null)
  }

  async function confirmAction() {
    if (!pendingPlatform) return

    setIsSubmitting(true)

    try {
      await platformsApi.deletePlatform(pendingPlatform.platformId)
      dashboardToast.success("پلتفرم با موفقیت حذف شد.")
      setPendingPlatform(null)
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
      open={pendingPlatform !== null}
      loading={isSubmitting}
      icon={Trash2Icon}
      title="حذف پلتفرم"
      description={
        pendingPlatform
          ? `آیا از حذف پلتفرم «${pendingPlatform.name}» اطمینان دارید؟ این عملیات قابل بازگشت نیست.`
          : ""
      }
      confirmLabel="حذف پلتفرم"
      onCancel={cancelAction}
      onConfirm={() => void confirmAction()}
    />
  )

  return {
    requestDelete,
    confirmDialog,
  }
}
