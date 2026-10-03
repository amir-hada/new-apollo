"use client";

import { useId, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const FIELD_H = 48;

type FloatingFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
  className?: string;
  /** Background behind the floating label cutout (match parent surface). */
  surfaceClassName?: string;
  /** Short help text shown in a tooltip next to the label. */
  hint?: string;
};

export function FloatingField({
  label,
  value,
  onChange,
  type = "text",
  required,
  minLength,
  autoComplete,
  disabled,
  dir,
  className,
  surfaceClassName = "bg-card",
  hint,
}: FloatingFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const floating = focused || value.trim().length > 0;

  return (
    <div className={cn("relative w-full min-w-0", className)} style={{ height: FIELD_H }}>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        disabled={disabled}
        dir={dir}
        placeholder=" "
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "absolute inset-0 w-full rounded-lg border px-3 text-sm outline-none transition-colors",
          "text-foreground/75 placeholder:text-muted-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          surfaceClassName,
          focused || floating ? "border-foreground/35" : "border-border",
        )}
        style={{
          height: FIELD_H,
          minHeight: FIELD_H,
          maxHeight: FIELD_H,
          boxSizing: "border-box",
          lineHeight: `${FIELD_H - 2}px`,
          paddingTop: 0,
          paddingBottom: 0,
        }}
      />

      <div
        className={cn(
          "absolute start-3 z-10 flex items-center gap-0.5 px-1 transition-[top,transform] duration-150",
          surfaceClassName,
          floating
            ? "top-0 -translate-y-1/2"
            : "top-1/2 -translate-y-1/2",
        )}
      >
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none leading-none transition-[font-size,color] duration-150",
            floating
              ? "text-[11px] text-muted-foreground"
              : "text-sm text-muted-foreground/80",
          )}
        >
          {label}
          {required ? <span className="ms-0.5 text-destructive">*</span> : null}
        </label>

        {hint ? (
          <TooltipProvider delay={200}>
            <Tooltip>
              <TooltipTrigger
                type="button"
                className={cn(
                  "inline-flex size-3.5 shrink-0 items-center justify-center",
                  "text-muted-foreground/75 transition-colors",
                  "hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-full",
                  !floating && "opacity-70",
                )}
                aria-label={`راهنمای ${label}`}
                onClick={(e) => e.preventDefault()}
              >
                <svg
                  viewBox="0 0 16 16"
                  className="size-3.5"
                  fill="none"
                  aria-hidden
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6.25"
                    stroke="currentColor"
                    strokeWidth="1.35"
                  />
                  <path
                    d="M6.35 6.15c0-1.05.8-1.8 1.85-1.8s1.85.72 1.85 1.7c0 .78-.4 1.2-1.05 1.58-.58.34-.8.58-.8 1.12v.25"
                    stroke="currentColor"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="11.35" r="0.85" fill="currentColor" />
                </svg>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="start"
                className="max-w-[17rem] px-3 py-2 text-start text-[11px] leading-5 font-normal"
              >
                {hint}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
    </div>
  );
}
