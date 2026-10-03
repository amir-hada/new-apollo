import { SaveIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type SettingsSaveConfirmDialogProps = {
  open: boolean
  saving?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function SettingsSaveConfirmDialog({
  open,
  saving,
  onCancel,
  onConfirm,
}: SettingsSaveConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) {
          onCancel()
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden border border-white/10 bg-zinc-950/95 p-0 sm:max-w-md"
      >
        <div className="h-1 w-full bg-primary" aria-hidden="true" />

        <div className="px-4 pt-5 pb-5 text-center">
          <div className="mb-3 flex justify-center">
            <SaveIcon
              className="size-8 text-primary"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>

          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-base font-light text-foreground">
              ذخیره تغییرات
            </DialogTitle>
            <DialogDescription className="text-xs font-light leading-6 text-muted-foreground">
              آیا از ذخیره تغییرات اطمینان دارید؟
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="!mx-0 !mb-0 gap-2 border-t border-white/10 bg-transparent px-4 py-2.5 sm:justify-end">
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center px-3 text-xs font-light text-destructive outline-none disabled:opacity-50"
            disabled={saving}
            onClick={onCancel}
          >
            لغو
          </button>
          <Button
            type="button"
            className="h-8 rounded-lg bg-primary px-4 text-xs font-light text-primary-foreground hover:bg-primary/90"
            disabled={saving}
            onClick={onConfirm}
          >
            {saving ? "در حال ذخیره..." : "تأیید"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
