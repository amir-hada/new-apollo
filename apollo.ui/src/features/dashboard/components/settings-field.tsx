import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type SettingsFieldProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
  id: string
  label: string
  error?: string | null
  hint?: string
  emptyPlaceholder?: string
  mutedWhenLocked?: boolean
}

export function SettingsField({
  id,
  label,
  error,
  hint,
  emptyPlaceholder = "-",
  mutedWhenLocked = true,
  className,
  value,
  readOnly,
  disabled,
  ...inputProps
}: SettingsFieldProps) {
  const isLocked = Boolean(readOnly || disabled)
  const displayValue =
    value === "" || value === undefined || value === null
      ? isLocked
        ? emptyPlaceholder
        : ""
      : value

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-xs font-light text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        value={displayValue}
        readOnly={readOnly}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-11 rounded-xl border-white/10 bg-zinc-900/70 px-4 text-xs font-light shadow-none",
          "read-only:cursor-default read-only:opacity-100",
          "disabled:cursor-not-allowed disabled:opacity-80",
          "focus-visible:border-primary/60 focus-visible:ring-primary/20",
          isLocked && mutedWhenLocked && "text-muted-foreground",
          className
        )}
        {...inputProps}
      />
      {hint ? <p className="text-xs font-light text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs font-light text-primary-soft">{error}</p> : null}
    </div>
  )
}
