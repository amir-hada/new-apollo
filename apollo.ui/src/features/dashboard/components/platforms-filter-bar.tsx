import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PlanFilterOption = {
  value: string
  label: string
}

type PlatformsFilterBarProps = {
  search: string
  onSearchChange: (value: string) => void
  planFilter: string
  onPlanFilterChange: (value: string) => void
  planOptions: PlanFilterOption[]
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function PlatformsFilterBar({
  search,
  onSearchChange,
  planFilter,
  onPlanFilterChange,
  planOptions,
  hasActiveFilters,
  onClearFilters,
}: PlatformsFilterBarProps) {
  const selectedPlan =
    planFilter === "all"
      ? null
      : planOptions.find((option) => option.value === planFilter)

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex w-full items-center gap-2">
        <div className="relative min-w-0 flex-[1.6]">
          <SearchIcon className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="جستجو..."
            className="h-9 w-full rounded-lg border-white/10 bg-background/80 px-2 ps-8 text-center text-xs font-light shadow-none transition-all duration-200 placeholder:text-center placeholder:text-muted-foreground/80 hover:border-white/20 hover:bg-background focus-visible:border-primary/35 focus-visible:bg-primary/5 focus-visible:shadow-[0_0_0_1px_rgba(60,92,255,0.12)] focus-visible:ring-0 dark:bg-background/80"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className={cn(
                  "inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-light transition-all duration-200",
                  "border-white/10 bg-background/80 hover:border-white/20 hover:bg-background",
                  "data-popup-open:border-primary/35 data-popup-open:bg-primary/5"
                )}
                aria-label="فیلتر پلن"
              />
            }
          >
            <span className="truncate">
              {selectedPlan?.label ?? "همه پلن‌ها"}
            </span>
            <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="min-w-[10rem] rounded-xl border border-white/10 bg-popover/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
          >
            <DropdownMenuItem
              className={cn(
                "rounded-lg px-2.5 py-2 text-xs font-light",
                planFilter === "all" && "bg-primary/10 text-primary"
              )}
              onClick={() => onPlanFilterChange("all")}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span>همه پلن‌ها</span>
                {planFilter === "all" ? (
                  <CheckIcon className="size-3.5 shrink-0" />
                ) : null}
              </span>
            </DropdownMenuItem>
            {planOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-xs font-light",
                  planFilter === option.value && "bg-primary/10 text-primary"
                )}
                onClick={() => onPlanFilterChange(option.value)}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span>{option.label}</span>
                  {planFilter === option.value ? (
                    <CheckIcon className="size-3.5 shrink-0" />
                  ) : null}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 rounded-lg px-2 text-xs font-light text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onClearFilters}
          >
            <XIcon data-icon="inline-start" />
            پاک کردن
          </Button>
        ) : null}
      </div>
    </div>
  )
}
