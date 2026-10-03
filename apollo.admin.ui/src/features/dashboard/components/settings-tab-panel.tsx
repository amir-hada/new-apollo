import * as React from "react"

import { cn } from "@/lib/utils"

type SettingsTabPanelProps = {
  active: boolean
  className?: string
  children: React.ReactNode
}

export function SettingsTabPanel({
  active,
  className,
  children,
}: SettingsTabPanelProps) {
  if (!active) {
    return null
  }

  return (
    <div
      className={cn(
        "motion-safe:animate-settings-fade-in settings-tab-stagger grid gap-8",
        className
      )}
    >
      {children}
    </div>
  )
}
