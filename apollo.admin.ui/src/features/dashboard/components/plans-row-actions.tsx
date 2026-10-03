import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { AdminPlanListItem } from "@/lib/api/plan-types"
import { cn } from "@/lib/utils"

type PlansRowActionsProps = {
  plan: AdminPlanListItem
  onDelete: (plan: AdminPlanListItem) => void
}

const actionButtonClass =
  "size-8 rounded-lg border-white/10 bg-transparent text-xs font-light"

export function PlansRowActions({ plan, onDelete }: PlansRowActionsProps) {
  return (
    <div
      className="flex items-center justify-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        title="حذف پلن"
        className={cn(
          actionButtonClass,
          "text-destructive hover:bg-destructive/10 hover:text-destructive"
        )}
        onClick={() => onDelete(plan)}
        aria-label={`حذف ${plan.name}`}
      >
        <Trash2Icon className="size-3.5" />
      </Button>
    </div>
  )
}
