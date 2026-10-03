import * as React from "react"
import { BanIcon, Trash2Icon, UserCheckIcon } from "lucide-react"

import { DestructiveConfirmDialog } from "@/components/shared/destructive-confirm-dialog"
import { adminApi } from "@/lib/api/admin-api"
import type { AdminUserListItem } from "@/lib/api/auth-types"
import { ApiError } from "@/lib/api/client"
import { dashboardToast } from "@/lib/dashboard-toast"

type PendingAction =
  | { type: "activate"; user: AdminUserListItem }
  | { type: "deactivate"; user: AdminUserListItem }
  | { type: "delete"; user: AdminUserListItem }

type UseAdminUserActionsOptions = {
  currentUserId?: string
  onSuccess: () => void
}

export function useAdminUserActions({
  currentUserId,
  onSuccess,
}: UseAdminUserActionsOptions) {
  const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function requestActivate(user: AdminUserListItem) {
    setPendingAction({ type: "activate", user })
  }

  function requestDeactivate(user: AdminUserListItem) {
    setPendingAction({ type: "deactivate", user })
  }

  function requestDelete(user: AdminUserListItem) {
    setPendingAction({ type: "delete", user })
  }

  function cancelAction() {
    if (isSubmitting) return
    setPendingAction(null)
  }

  async function confirmAction() {
    if (!pendingAction) return

    if (
      pendingAction.user.userId.toLowerCase() === currentUserId?.toLowerCase()
    ) {
      dashboardToast.error("امکان انجام این عملیات روی حساب خودتان وجود ندارد.")
      setPendingAction(null)
      return
    }

    setIsSubmitting(true)

    try {
      if (pendingAction.type === "delete") {
        await adminApi.deleteUser(pendingAction.user.userId)
        dashboardToast.success("کاربر با موفقیت حذف شد.")
      } else {
        const isActive = pendingAction.type === "activate"
        await adminApi.setUserStatus(pendingAction.user.userId, isActive)
        dashboardToast.success(
          isActive ? "کاربر با موفقیت فعال شد." : "کاربر با موفقیت غیرفعال شد."
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
      ? "حذف کاربر"
      : pendingAction.type === "deactivate"
        ? "غیرفعال‌سازی کاربر"
        : "فعال‌سازی کاربر"

  const dialogDescription = !pendingAction
    ? ""
    : pendingAction.type === "delete"
      ? `آیا از حذف دائمی کاربر «${pendingAction.user.username}» اطمینان دارید؟ تمام داده‌های مرتبط با این کاربر از سیستم پاک می‌شود.`
      : pendingAction.type === "deactivate"
        ? `آیا از غیرفعال‌سازی کاربر «${pendingAction.user.username}» اطمینان دارید؟ این کاربر دیگر نمی‌تواند وارد سیستم شود.`
        : `آیا از فعال‌سازی مجدد کاربر «${pendingAction.user.username}» اطمینان دارید؟`

  const dialogConfirmLabel = !pendingAction
    ? "تأیید"
    : pendingAction.type === "delete"
      ? "حذف کاربر"
      : pendingAction.type === "deactivate"
        ? "غیرفعال‌سازی"
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
