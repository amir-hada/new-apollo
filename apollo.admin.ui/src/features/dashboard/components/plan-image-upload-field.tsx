import { ImagePlusIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type PlanImageUploadFieldProps = {
  previewUrl: string | null
  disabled?: boolean
  onSelect: () => void
  onRemove: () => void
  className?: string
  variant?: "dialog" | "settings"
  emptyLabel?: string
  previewAlt?: string
}

export function PlanImageUploadField({
  previewUrl,
  disabled = false,
  onSelect,
  onRemove,
  className,
  variant = "dialog",
  emptyLabel = "آپلود تصویر پلن",
  previewAlt = "پیش‌نمایش تصویر پلن",
}: PlanImageUploadFieldProps) {
  const isSettings = variant === "settings"

  return (
    <div
      className={cn(
        "group/upload relative",
        isSettings ? "h-11" : "h-12",
        className
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden border transition-all duration-200",
          isSettings ? "h-11 rounded-xl" : "h-12 rounded-lg border-dashed",
          previewUrl
            ? isSettings
              ? "border-white/10 bg-white/[0.04]"
              : "border-primary/30 bg-primary/5"
            : isSettings
              ? "border-white/10 bg-white/[0.04] hover:border-white/15 hover:bg-white/[0.06]"
              : "border-white/15 bg-background/80 hover:border-primary/30 hover:bg-primary/5",
          "disabled:pointer-events-none disabled:opacity-80"
        )}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={previewAlt}
              className="absolute inset-0 size-full object-cover"
            />
            <span className="absolute inset-0 bg-black/35 opacity-0 transition-opacity group-hover/upload:opacity-100" />
            <span className="relative z-10 rounded-md bg-black/50 px-2 py-1 text-[10px] font-light text-white opacity-0 transition-opacity group-hover/upload:opacity-100">
              تغییر تصویر
            </span>
          </>
        ) : (
          <span
            className={cn(
              "flex items-center gap-2 text-xs font-light text-muted-foreground transition-colors",
              isSettings
                ? "group-hover/upload:text-foreground"
                : "group-hover/upload:text-primary"
            )}
          >
            {isSettings ? (
              <ImagePlusIcon className="size-3.5 text-primary" />
            ) : (
              <span className="flex size-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-primary">
                <ImagePlusIcon className="size-3.5" />
              </span>
            )}
            <span>{emptyLabel}</span>
          </span>
        )}
      </button>

      {previewUrl ? (
        <button
          type="button"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          className={cn(
            "absolute -top-1.5 -left-1.5 z-20 flex size-5 items-center justify-center rounded-full",
            "border border-white/15 bg-card shadow-sm transition-colors",
            "text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
          aria-label="حذف تصویر"
        >
          <XIcon className="size-3" />
        </button>
      ) : null}
    </div>
  )
}
