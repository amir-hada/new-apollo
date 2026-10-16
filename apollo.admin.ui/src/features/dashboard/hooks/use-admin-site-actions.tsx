import * as React from "react"
import { BanIcon, Trash2Icon, UserCheckIcon } from "lucide-react"

import { DestructiveConfirmDialog } from "@/components/shared/destructive-confirm-dialog"
import { adminApi } from "@/lib/api/admin-api"
import { ApiError } from "@/lib/api/client"
import type { AdminSiteListItem } from "@/lib/api/site-types"
import { dashboardToast } from "@/lib/dashboard-toast"

type PendingAction =
  | { type: "activate"; site: AdminSiteListItem }
  | { type: "deactivate"; site: AdminSiteListItem }
  | { type: "delete"; site: AdminSiteListItem }

type UseAdminSiteActionsOptions = {
  onSuccess: () => void
}

export function useAdminSiteActions({ onSuccess }: UseAdminSiteActionsOptions) {
  const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function requestActivate(site: AdminSiteListItem) {
    setPendingAction({ type: "activate", site })
  }

  function requestDeactivate(site: AdminSiteListItem) {
    setPendingAction({ type: "deactivate", site })
  }

  function requestDelete(site: AdminSiteListItem) {
    setPendingAction({ type: "delete", site })
  }

  function cancelAction() {
    if (isSubmitting) return
    setPendingAction(null)
  }

  async function confirmAction() {
    if (!pendingAction) return

    setIsSubmitting(true)

    try {
      if (pendingAction.type === "delete") {
        await adminApi.deleteSite(pendingAction.site.platformId)
        dashboardToast.success("سایت با موفقیت حذف شد.")
      } else {
        const isActive = pendingAction.type === "activate"
        await adminApi.setSiteStatus(pendingAction.site.platformId, isActive)
        dashboardToast.success(
          isActive ? "سایت با موفقیت فعال شد." : "سایت با موفقیت تعلیق شد."
        )
      }

      setPendingAction(null)
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

  const dialogTitle = !pendingAction
    ? ""
    : pendingAction.type === "delete"
      ? "حذف سایت"
      : pendingAction.type === "deactivate"
        ? "تعلیق سایت"
        : "فعال‌سازی سایت"

  const siteLabel = pendingAction
    ? pendingAction.site.name || pendingAction.site.slug || "سایت"
    : ""

  const dialogDescription = !pendingAction
    ? ""
    : pendingAction.type === "delete"
      ? `آیا از حذف دائمی سایت «${siteLabel}» اطمینان دارید؟ فروشگاه، داده‌های محصولات، سفارش‌ها و کاربران آن برای همیشه پاک می‌شود.`
      : pendingAction.type === "deactivate"
        ? `آیا از تعلیق سایت «${siteLabel}» اطمینان دارید؟ فروشگاه تا فعال‌سازی مجدد در دسترس نخواهد بود.`
        : `آیا از فعال‌سازی مجدد سایت «${siteLabel}» اطمینان دارید؟`

  const dialogConfirmLabel = !pendingAction
    ? "تأیید"
    : pendingAction.type === "delete"
      ? "حذف سایت"
      : pendingAction.type === "deactivate"
        ? "تعلیق"
        : "فعال‌سازی"

  const dialogIcon = !pendingAction
    ? BanIcon
    : pendingAction.type === "delete"
      ? Trash2Icon
      : pendingAction.type === "deactivate"
        ? BanIcon
        : UserCheckIcon

  const confirmDialog = (
    <DestructiveConfirmDialog
      open={pendingAction !== null}
      loading={isSubmitting}
      icon={dialogIcon}
      title={dialogTitle}
      description={dialogDescription}
      confirmLabel={dialogConfirmLabel}
      onCancel={cancelAction}
      onConfirm={() => void confirmAction()}
    />
  )

  return {
    requestActivate,
    requestDeactivate,
    requestDelete,
    confirmDialog,
  }
}
