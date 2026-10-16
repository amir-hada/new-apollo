"use client";

import { useEffect, useMemo, useRef } from "react";
import { formatOtpDisplay } from "@/features/auth/normalize-phone";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  className?: string;
};

const OTP_LENGTH = 5;

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  autoFocus = false,
  className,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = useMemo(
    () => Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? ""),
    [value],
  );

  useEffect(() => {
    if (!autoFocus || disabled) return;
    const frame = requestAnimationFrame(() => focusInput(0));
    return () => cancelAnimationFrame(frame);
  }, [autoFocus, disabled]);

  function focusInput(index: number) {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  }

  function updateValue(nextDigits: string[]) {
    const next = nextDigits.join("").slice(0, OTP_LENGTH);
    onChange(next);
    if (next.length === OTP_LENGTH) {
      onComplete?.(next);
    }
  }

  function handleChange(index: number, nextValue: string) {
    const digit = formatOtpDisplay(nextValue).slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = digit;
    updateValue(nextDigits);
    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = formatOtpDisplay(event.clipboardData.getData("text"));
    if (!pasted) return;
    onChange(pasted);
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
    if (pasted.length === OTP_LENGTH) {
      onComplete?.(pasted);
    }
  }

  return (
    <div dir="ltr" className={cn("flex items-center justify-center gap-1.5 sm:gap-2.5", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`رقم ${index + 1} کد تأیید`}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-11 w-10 rounded-lg border border-border bg-card text-center text-base font-medium text-foreground outline-none transition sm:h-12 sm:w-11 sm:text-lg",
            "focus:border-foreground",
            invalid && "border-red-500 focus:border-red-500",
            disabled && "cursor-not-allowed opacity-50",
          )}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
        />
      ))}
    </div>
  );
}
