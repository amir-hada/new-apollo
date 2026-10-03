"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Check, ChevronDownIcon, Search } from "lucide-react";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const FIELD_H = 48;
const MAX_VISIBLE = 10;

type FloatingSelectOption = {
  value: string;
  label: string;
};

type FloatingSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FloatingSelectOption[];
  emptyValue?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  surfaceClassName?: string;
  inactive?: boolean;
  onInactiveClick?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
};

export function FloatingSelect({
  label,
  value,
  onChange,
  options,
  emptyValue = "",
  required,
  disabled,
  className,
  surfaceClassName = "bg-card",
  inactive,
  onInactiveClick,
  searchable = true,
  searchPlaceholder = "جستجو ...",
}: FloatingSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const hasValue = value !== emptyValue && value.trim().length > 0;
  const floating = open || hasValue;

  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label ?? "",
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(q),
    );
  }, [options, query]);

  const visibleOptions = filteredOptions.slice(0, MAX_VISIBLE);
  const remainingCount = Math.max(filteredOptions.length - MAX_VISIBLE, 0);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        if (inactive) {
          if (next) onInactiveClick?.();
          return;
        }
        setOpen(next);
      }}
    >
      <div className={cn("relative", className)} style={{ height: FIELD_H }}>
        <PopoverTrigger
          disabled={disabled}
          render={
            <button
              type="button"
              id={id}
              aria-haspopup="listbox"
              aria-expanded={open}
              className={cn(
                "absolute inset-0 flex w-full items-center rounded-lg border pe-9 ps-3 text-start text-sm outline-none transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "cursor-pointer",
                surfaceClassName,
                open || floating ? "border-foreground/35" : "border-border",
              )}
            />
          }
        >
          <span
            className={cn(
              "truncate",
              hasValue ? "text-foreground/75" : "text-transparent",
            )}
          >
            {selectedLabel || label}
          </span>
        </PopoverTrigger>

        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute start-3 z-10 px-1 leading-none transition-[font-size,top,color] duration-150",
            surfaceClassName,
            floating
              ? "top-0 -translate-y-1/2 text-[11px] text-muted-foreground"
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground/80",
          )}
        >
          {label}
          {required ? <span className="ms-0.5 text-destructive">*</span> : null}
        </label>

        <ChevronDownIcon
          className={cn(
            "pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </div>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-(--anchor-width) min-w-(--anchor-width) gap-0 overflow-hidden rounded-lg p-0 shadow-md"
      >
        {searchable ? (
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-md border border-border bg-transparent pe-2.5 ps-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-border focus-visible:ring-0"
              />
            </div>
          </div>
        ) : null}

        <ul
          role="listbox"
          aria-labelledby={id}
          className="flex max-h-60 flex-col gap-0.5 overflow-y-auto p-1"
        >
          {visibleOptions.length === 0 ? (
            <li className="px-2.5 py-3 text-center text-sm text-muted-foreground">
              موردی یافت نشد
            </li>
          ) : (
            visibleOptions.map((option) => {
              const selected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-start text-sm transition-colors",
                      selected
                        ? "bg-primary/10 text-foreground"
                        : "text-foreground hover:bg-muted",
                    )}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-transparent",
                      )}
                      aria-hidden
                    >
                      <Check
                        className={cn(
                          "size-3",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {remainingCount > 0 ? (
          <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
            و {toPersianDigits(String(remainingCount))} مورد دیگر
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
