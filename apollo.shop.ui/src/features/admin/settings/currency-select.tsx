"use client";

import { useEffect, useId, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SHOP_CURRENCIES, type ShopCurrency } from "@/lib/shop-currency";
import { cn } from "@/lib/utils";

type CurrencySelectProps = {
  id?: string;
  value: string;
  onChange: (value: ShopCurrency) => void;
  className?: string;
  disabled?: boolean;
};

export function CurrencySelect({
  id,
  value,
  onChange,
  className,
  disabled,
}: CurrencySelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [open, setOpen] = useState(false);
  const selected =
    SHOP_CURRENCIES.find((c) => c.value === value) ?? SHOP_CURRENCIES[0];

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <PopoverTrigger
        id={fieldId}
        disabled={disabled}
        render={
          <button
            type="button"
            className={cn(
              "group flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors",
              "hover:border-foreground/30 focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
              open && "border-foreground/40 ring-2 ring-ring/30",
              className,
            )}
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "inline-flex size-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold",
              selected.value === "ریال"
                ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
            )}
          >
            {selected.value === "ریال" ? "﷼" : "ت"}
          </span>
          <span className="truncate font-medium">{selected.label}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--anchor-width)] min-w-[12rem] p-1.5"
      >
        <div className="space-y-0.5">
          {SHOP_CURRENCIES.map((option) => {
            const active = option.value === selected.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-foreground",
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
                    option.value === "ریال"
                      ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                      : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
                  )}
                >
                  {option.value === "ریال" ? "﷼" : "ت"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium leading-none">{option.label}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {option.value === "ریال"
                      ? "نمایش قیمت ×۱۰ نسبت به تومان"
                      : "واحد پایه ذخیره قیمت‌ها"}
                  </span>
                </span>
                {active ? <Check className="size-4 shrink-0 text-primary" /> : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
