import { BanIcon, Trash2Icon, UserCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { AdminSiteListItem } from "@/lib/api/site-types"
import { cn } from "@/lib/utils"

type SitesRowActionsProps = {
  site: AdminSiteListItem
  onActivate: (site: AdminSiteListItem) => void
  onDeactivate: (site: AdminSiteListItem) => void
  onDelete: (site: AdminSiteListItem) => void
}

const actionButtonClass =
  "size-8 rounded-lg border-white/10 bg-transparent text-xs font-light"

export function SitesRowActions({
  site,
  onActivate,
  onDeactivate,
  onDelete,
}: SitesRowActionsProps) {
  const isActive = site.isActive !== false
  const canToggleStatus =
    Boolean(site.slug) && site.provisioningStatus === "Ready"

  return (
    <div
      className="flex items-center justify-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      {canToggleStatus ? (
        isActive ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            title="تعلیق سایت"
            className={cn(actionButtonClass, "text-amber-400 hover:text-amber-300")}
            onClick={() => onDeactivate(site)}
            aria-label={`تعلیق ${site.name}`}
          >
            <BanIcon className="size-3.5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            title="فعال‌سازی سایت"
            className={cn(
              actionButtonClass,
              "text-emerald-400 hover:text-emerald-300"
            )}
            onClick={() => onActivate(site)}
            aria-label={`فعال‌سازی ${site.name}`}
          >
            <UserCheckIcon className="size-3.5" />
          </Button>
        )
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        title="حذف سایت"
        className={cn(
          actionButtonClass,
          "text-destructive hover:bg-destructive/10 hover:text-destructive"
        )}
        onClick={() => onDelete(site)}
        aria-label={`حذف ${site.name}`}
      >
        <Trash2Icon className="size-3.5" />
      </Button>
    </div>
  )
}
