import { EyeIcon, Trash2Icon } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import type { UserPlatformListItem } from "@/lib/api/platform-types"
import { cn } from "@/lib/utils"

type PlatformsRowActionsProps = {
  platform: UserPlatformListItem
  onDelete: (platform: UserPlatformListItem) => void
}

const actionButtonClass =
  "size-8 rounded-lg border-white/10 bg-transparent text-xs font-light"

export function PlatformsRowActions({
  platform,
  onDelete,
}: PlatformsRowActionsProps) {
  return (
    <div
      className="flex items-center justify-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        title="جزئیات پلتفرم"
        className={cn(actionButtonClass, "text-primary hover:text-primary")}
        render={
          <Link to={`/dashboard/platforms/${platform.platformId}`} />
        }
        aria-label={`جزئیات ${platform.name}`}
      >
        <EyeIcon className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        title="حذف پلتفرم"
        className={cn(
          actionButtonClass,
          "text-destructive hover:bg-destructive/10 hover:text-destructive"
        )}
        onClick={() => onDelete(platform)}
        aria-label={`حذف ${platform.name}`}
      >
        <Trash2Icon className="size-3.5" />
      </Button>
    </div>
  )
}
