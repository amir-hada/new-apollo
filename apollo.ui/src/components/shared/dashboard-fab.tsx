import * as React from "react"
import { createPortal } from "react-dom"
import { PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type DashboardFabProps = {
  label: string
  onClick: () => void
  className?: string
}

export function DashboardFab({ label, onClick, className }: DashboardFabProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "fixed bottom-6 left-6 z-[120] inline-flex size-12 items-center justify-center rounded-[4px]",
        "bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(60,92,255,0.45)]",
        "transition-all duration-200 hover:scale-[1.03] hover:bg-primary/90 hover:shadow-[0_14px_36px_rgba(60,92,255,0.55)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
    >
      <PlusIcon className="size-5" strokeWidth={2} />
    </button>,
    document.body
  )
}
