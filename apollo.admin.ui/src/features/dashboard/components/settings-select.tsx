import { CheckIcon, ChevronDownIcon } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type SettingsSelectOption<T extends string> = {
  value: T
  label: string
}

type SettingsSelectProps<T extends string> = {
  id: string
  label: string
  value: T
  options: SettingsSelectOption<T>[]
  onChange: (value: T) => void
  disabled?: boolean
  className?: string
  hideLabel?: boolean
}

export function SettingsSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  className,
  hideLabel = false,
}: SettingsSelectProps<T>) {
  const selected = options.find((option) => option.value === value)

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      {hideLabel ? (
        <span className="sr-only">{label}</span>
      ) : (
        <Label htmlFor={id} className="text-xs font-light text-foreground">
          {label}
        </Label>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          render={
            <button
              id={id}
              type="button"
              className={cn(
                "group/settings-select inline-flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-light shadow-none transition-colors",
                "hover:border-white/15 hover:bg-white/[0.06]",
                "disabled:cursor-not-allowed disabled:opacity-80",
                "data-popup-open:border-primary/50 data-popup-open:bg-white/[0.05] data-popup-open:ring-3 data-popup-open:ring-primary/20"
              )}
              aria-label={label}
            />
          }
        >
          <span className="truncate text-foreground">
            {selected?.label ?? label}
          </span>
          <ChevronDownIcon
            className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-popup-open/settings-select:rotate-180"
            strokeWidth={1.5}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className={cn(
            "min-w-(--anchor-width) w-(--anchor-width) rounded-xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-md",
            "motion-safe:animate-toolbar-menu-in"
          )}
        >
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={cn(
                "rounded-lg px-3 py-2.5 text-xs font-light transition-colors",
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
