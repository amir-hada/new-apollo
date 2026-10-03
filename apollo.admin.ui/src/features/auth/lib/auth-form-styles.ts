import { cn } from "@/lib/utils"

export const authFormTextClass = "text-sm font-light"

export const authFormLabelClass =
  "text-sm font-light text-muted-foreground"

export const authFormButtonClass = "text-sm font-light"

export const authFormFieldErrorClass =
  "text-xs font-light leading-4 text-destructive/80"

/** Solid fill shared by the panel and the "یا" separator chip */
export const authPanelFillClass = "bg-card"

export const authPanelClass = cn(
  "border border-white/12 shadow-[0_8px_40px_rgba(0,0,0,0.28)]",
  authPanelFillClass
)

export const authPanelRegisterClass = cn(
  "border border-primary/25 shadow-[0_8px_40px_rgba(60,92,255,0.12)]",
  authPanelFillClass
)

/** Solid fill for fields and outline buttons (darker than the panel for contrast) */
export const authFieldFillClass = "bg-background"

/** Input frame without border — the border is drawn by the notched fieldset */
export const authInputFrameClass = cn(
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]",
  authFieldFillClass
)

export const authOutlineButtonClass = cn(
  "hover:text-foreground",
  "!border-white/18 !bg-background dark:!border-white/18 dark:!bg-background",
  "hover:!border-white/28 hover:!bg-muted dark:hover:!bg-muted"
)
