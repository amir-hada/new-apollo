import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type DestructiveConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  loadingLabel?: string
  loading?: boolean
  icon: LucideIcon
  onCancel: () => void
  onConfirm: () => void
}

export function DestructiveConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "تأیید",
  loadingLabel = "در حال انجام...",
  loading = false,
  icon: Icon,
  onCancel,
  onConfirm,
}: DestructiveConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !loading) {
          onCancel()
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden border border-white/10 bg-zinc-950/95 p-0 sm:max-w-md"
      >
        <div className="h-1 w-full bg-destructive" aria-hidden="true" />

        <div className="px-4 pt-5 pb-5 text-center">
          <div className="mb-3 flex justify-center">
            <Icon
              className="size-8 text-destructive"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>

          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-base font-light text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs font-light leading-6 text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="!mx-0 !mb-0 gap-2 border-t border-white/10 bg-transparent px-4 py-2.5 sm:justify-end">
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center px-3 text-xs font-light text-muted-foreground outline-none disabled:opacity-50"
            disabled={loading}
            onClick={onCancel}
          >
            لغو
          </button>
          <Button
            type="button"
            className={cn(
              "h-8 rounded-lg px-4 text-xs font-light",
              "bg-destructive text-white hover:bg-destructive/90"
            )}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? loadingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
