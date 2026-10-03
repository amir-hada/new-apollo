import { CheckIcon, ChevronDownIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { StatusFilter } from "@/features/dashboard/hooks/use-users-data-grid"
import { cn } from "@/lib/utils"

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "همه وضعیت‌ها" },
  { value: "active", label: "فعال" },
  { value: "inactive", label: "غیرفعال" },
]

type UsersStatusFilterDropdownProps = {
  value: StatusFilter
  onChange: (value: StatusFilter) => void
  className?: string
}

export function UsersStatusFilterDropdown({
  value,
  onChange,
  className,
}: UsersStatusFilterDropdownProps) {
  const selected =
    statusOptions.find((option) => option.value === value) ?? statusOptions[0]
  const displayLabel = value === "all" ? "وضعیت" : selected.label

  return (
    <div className={cn("min-w-0", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={cn(
                "group/status-filter inline-flex h-9 w-full min-w-0 items-center justify-center rounded-lg border px-2 text-center transition-all duration-200",
                "border-white/10 bg-background/80 hover:border-white/20 hover:bg-background",
                "data-popup-open:border-primary/35 data-popup-open:bg-primary/5 data-popup-open:shadow-[0_0_0_1px_rgba(60,92,255,0.12)]"
              )}
              aria-label="فیلتر وضعیت کاربران"
            />
          }
        >
          <span className="flex w-full min-w-0 items-center justify-center gap-1.5">
            <span
              className={cn(
                "truncate text-xs font-light",
                value === "all" ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {displayLabel}
            </span>
            <ChevronDownIcon
              className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-popup-open/status-filter:rotate-180"
              strokeWidth={1.5}
            />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className={cn(
            "min-w-[9.5rem] rounded-xl border border-white/10 bg-popover/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-md",
            "motion-safe:animate-toolbar-menu-in"
          )}
        >
          {statusOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={cn(
                "rounded-lg px-2.5 py-2 text-xs font-light transition-colors",
                "focus:bg-white/6",
                value === option.value && "bg-primary/10 text-primary"
              )}
              onClick={() => onChange(option.value)}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span>{option.label}</span>
                {value === option.value ? (
                  <CheckIcon className="size-3.5 shrink-0" />
                ) : null}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
