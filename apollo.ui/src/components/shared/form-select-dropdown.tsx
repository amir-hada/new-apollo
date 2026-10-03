import { CheckIcon, ChevronDownIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FieldError } from "@/components/ui/field"
import { authFormFieldErrorClass } from "@/features/auth/lib/auth-form-styles"
import { cn } from "@/lib/utils"

type FormSelectOption<T extends string> = {
  value: T
  label: string
}

type FormSelectDropdownProps<T extends string> = {
  value: T | null
  options: FormSelectOption<T>[]
  onChange: (value: T) => void
  label: string
  error?: string | null
  disabled?: boolean
  className?: string
  ariaLabel: string
}

export function FormSelectDropdown<T extends string>({
  value,
  options,
  onChange,
  label,
  error,
  disabled = false,
  className,
  ariaLabel,
}: FormSelectDropdownProps<T>) {
  const selected = value ? options.find((option) => option.value === value) : null
  const displayLabel = selected?.label ?? label
  const invalid = Boolean(error)

  return (
    <div className={cn("min-w-0", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          render={
            <button
              type="button"
              className={cn(
                "group/form-select inline-flex h-12 w-full min-w-0 items-center justify-center rounded-lg border px-2 text-center transition-all duration-200",
                "border-white/10 bg-background/80 hover:border-white/20 hover:bg-background",
                "disabled:pointer-events-none disabled:opacity-50",
                "data-popup-open:border-primary/35 data-popup-open:bg-primary/5 data-popup-open:shadow-[0_0_0_1px_rgba(60,92,255,0.12)]",
                invalid && "border-destructive/50"
              )}
              aria-label={ariaLabel}
              aria-invalid={invalid || undefined}
            />
          }
        >
          <span className="flex w-full min-w-0 items-center justify-center gap-1.5">
            <span
              className={cn(
                "truncate text-xs font-light",
                selected ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {displayLabel}
            </span>
            <ChevronDownIcon
              className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-popup-open/form-select:rotate-180"
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
          {options.map((option) => (
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

      {error ? (
        <FieldError className={cn(authFormFieldErrorClass, "mt-1")}>
          {error}
        </FieldError>
      ) : null}
    </div>
  )
}
