import {
  BanIcon,
  Trash2Icon,
  UserCheckIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { AdminUserListItem } from "@/lib/api/auth-types"
import { cn } from "@/lib/utils"

type UsersRowActionsProps = {
  user: AdminUserListItem
  currentUserId?: string
  onActivate: (user: AdminUserListItem) => void
  onDeactivate: (user: AdminUserListItem) => void
  onDelete: (user: AdminUserListItem) => void
}

function isSameUser(left?: string, right?: string) {
  if (!left || !right) return false
  return left.toLowerCase() === right.toLowerCase()
}

const actionButtonClass =
  "size-8 rounded-lg border-white/10 bg-transparent text-xs font-light"

export function UsersRowActions({
  user,
  currentUserId,
  onActivate,
  onDeactivate,
  onDelete,
}: UsersRowActionsProps) {
  const isSelf = isSameUser(user.userId, currentUserId)
  const isActive = user.isActive !== false

  return (
    <div
      className="flex items-center justify-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      {isActive ? (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isSelf}
          title="غیرفعال‌سازی"
          className={cn(actionButtonClass, "text-amber-400 hover:text-amber-300")}
          onClick={() => onDeactivate(user)}
          aria-label={`غیرفعال‌سازی ${user.username}`}
        >
          <BanIcon className="size-3.5" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isSelf}
          title="فعال‌سازی"
          className={cn(actionButtonClass, "text-emerald-400 hover:text-emerald-300")}
          onClick={() => onActivate(user)}
          aria-label={`فعال‌سازی ${user.username}`}
        >
          <UserCheckIcon className="size-3.5" />
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={isSelf}
        title="حذف کاربر"
        className={cn(
          actionButtonClass,
          "text-destructive hover:bg-destructive/10 hover:text-destructive"
        )}
        onClick={() => onDelete(user)}
        aria-label={`حذف ${user.username}`}
      >
        <Trash2Icon className="size-3.5" />
      </Button>
    </div>
  )
}
