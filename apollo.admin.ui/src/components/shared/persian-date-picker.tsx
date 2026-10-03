import * as React from "react"
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  formatJalaliDate,
  getMonthGrid,
  getTodayJalali,
  isoDateToJalali,
  isSameJalaliDate,
  jalaliToIsoDate,
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEKDAY_NAMES,
  shiftJalaliMonth,
  toPersianDigits,
  type JalaliDateParts,
  type JalaliMonthView,
} from "@/lib/jalali/jalali-date"
import { cn } from "@/lib/utils"

type PersianDatePickerProps = {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  className?: string
  "aria-label"?: string
}

type PickerPanel = "day" | "month" | "year"

const triggerClassName = cn(
  "group/persian-date inline-flex h-9 w-full min-w-0 items-center justify-center rounded-lg border px-2 text-center transition-all duration-200",
  "border-white/10 bg-background/80 hover:border-white/20 hover:bg-background",
  "data-popup-open:border-primary/35 data-popup-open:bg-primary/5 data-popup-open:shadow-[0_0_0_1px_rgba(60,92,255,0.12)]"
)

function getYearRange(centerYear: number) {
  const start = centerYear - 5
  return Array.from({ length: 12 }, (_, index) => start + index)
}

export function PersianDatePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className,
  "aria-label": ariaLabel,
}: PersianDatePickerProps) {
  const today = React.useMemo(() => getTodayJalali(), [])
  const selected = isoDateToJalali(value)
  const [open, setOpen] = React.useState(false)
  const [panel, setPanel] = React.useState<PickerPanel>("day")
  const [view, setView] = React.useState<JalaliMonthView>(() => {
    const initial = selected ?? today
    return { year: initial.year, month: initial.month }
  })
  const [yearPageStart, setYearPageStart] = React.useState(() => {
    const initial = selected ?? today
    return initial.year - 5
  })

  React.useEffect(() => {
    if (selected) {
      setView({ year: selected.year, month: selected.month })
      setYearPageStart(selected.year - 5)
    }
  }, [selected?.year, selected?.month])

  React.useEffect(() => {
    if (!open) {
      setPanel("day")
    }
  }, [open])

  const cells = React.useMemo(
    () => getMonthGrid(view.year, view.month),
    [view.month, view.year]
  )

  const yearOptions = React.useMemo(
    () => getYearRange(yearPageStart),
    [yearPageStart]
  )

  function handleSelectDay(day: JalaliDateParts) {
    onChange(jalaliToIsoDate(day))
    setOpen(false)
  }

  function handleSelectMonth(month: number) {
    setView((current) => ({ ...current, month }))
    setPanel("day")
  }

  function handleSelectYear(year: number) {
    setView((current) => ({ ...current, year }))
    setYearPageStart(year - 5)
    setPanel("month")
  }

  return (
    <div className={cn("min-w-0", className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={triggerClassName}
              aria-label={ariaLabel ?? placeholder}
            />
          }
        >
          <span className="flex min-w-0 items-center justify-center gap-1.5">
            <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span
              className={cn(
                "truncate text-xs font-light",
                selected ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {selected ? formatJalaliDate(selected) : placeholder}
            </span>
            <ChevronDownIcon
              className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-popup-open/persian-date:rotate-180"
              strokeWidth={1.5}
            />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className={cn(
            "w-[17.5rem] rounded-xl border border-white/10 bg-popover/95 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-md",
            "motion-safe:animate-toolbar-menu-in"
          )}
        >
          {panel === "day" ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-lg"
                  onClick={() =>
                    setView((current) => shiftJalaliMonth(current, 1))
                  }
                  aria-label="ماه بعد"
                >
                  <ChevronRightIcon />
                </Button>

                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    className="rounded-md px-1.5 py-0.5 text-xs font-light text-foreground transition-colors hover:bg-white/8"
                    onClick={() => setPanel("month")}
                  >
                    {PERSIAN_MONTH_NAMES[view.month - 1]}
                  </button>
                  <button
                    type="button"
                    className="rounded-md px-1.5 py-0.5 text-xs font-light text-foreground transition-colors hover:bg-white/8"
                    onClick={() => {
                      setYearPageStart(view.year - 5)
                      setPanel("year")
                    }}
                  >
                    {toPersianDigits(view.year)}
                  </button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-lg"
                  onClick={() =>
                    setView((current) => shiftJalaliMonth(current, -1))
                  }
                  aria-label="ماه قبل"
                >
                  <ChevronLeftIcon />
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1">
                {PERSIAN_WEEKDAY_NAMES.map((weekday) => (
                  <div
                    key={weekday}
                    className="flex size-8 items-center justify-center text-[10px] font-light text-muted-foreground"
                  >
                    {weekday}
                  </div>
                ))}

                {cells.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="size-8" />
                  }

                  const isSelected = isSameJalaliDate(day, selected)
                  const isToday = isSameJalaliDate(day, today)

                  return (
                    <button
                      key={jalaliToIsoDate(day)}
                      type="button"
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg text-xs font-light transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                            ? "border border-primary/30 bg-primary/10 text-primary"
                            : "text-foreground hover:bg-white/8"
                      )}
                      onClick={() => handleSelectDay(day)}
                    >
                      {toPersianDigits(day.day)}
                    </button>
                  )
                })}
              </div>
            </>
          ) : null}

          {panel === "month" ? (
            <>
              <div className="mb-3 flex items-center justify-start">
                <button
                  type="button"
                  className="rounded-md px-1.5 py-0.5 text-xs font-light text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
                  onClick={() => setPanel("day")}
                >
                  بازگشت
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {PERSIAN_MONTH_NAMES.map((monthName, index) => {
                  const month = index + 1
                  const isActive = view.month === month

                  return (
                    <button
                      key={monthName}
                      type="button"
                      className={cn(
                        "rounded-lg px-2 py-2 text-xs font-light transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-white/8"
                      )}
                      onClick={() => handleSelectMonth(month)}
                    >
                      {monthName}
                    </button>
                  )
                })}
              </div>
            </>
          ) : null}

          {panel === "year" ? (
            <>
              <div className="mb-3 flex items-center justify-start">
                <button
                  type="button"
                  className="rounded-md px-1.5 py-0.5 text-xs font-light text-muted-foreground transition-colors hover:bg-white/8 hover:text-foreground"
                  onClick={() => setPanel("day")}
                >
                  بازگشت
                </button>
              </div>

              <div className="mb-2 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-lg"
                  onClick={() => setYearPageStart((current) => current - 12)}
                  aria-label="سال‌های قبل‌تر"
                >
                  <ChevronRightIcon />
                </Button>
                <span className="text-[11px] font-light text-muted-foreground">
                  {toPersianDigits(yearPageStart)} –{" "}
                  {toPersianDigits(yearPageStart + 11)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-lg"
                  onClick={() => setYearPageStart((current) => current + 12)}
                  aria-label="سال‌های بعدتر"
                >
                  <ChevronLeftIcon />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {yearOptions.map((year) => {
                  const isActive = view.year === year

                  return (
                    <button
                      key={year}
                      type="button"
                      className={cn(
                        "rounded-lg px-2 py-2 text-xs font-light transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-white/8"
                      )}
                      onClick={() => handleSelectYear(year)}
                    >
                      {toPersianDigits(year)}
                    </button>
                  )
                })}
              </div>
            </>
          ) : null}

          {selected ? (
            <button
              type="button"
              className="mt-3 w-full rounded-lg py-1.5 text-center text-xs font-light text-destructive transition-colors hover:bg-destructive/10"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              پاک کردن تاریخ
            </button>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
