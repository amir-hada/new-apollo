import * as React from "react"

import { normalizeOtpInput } from "@/features/auth/lib/normalize-digits"
import { cn } from "@/lib/utils"

type OtpInputProps = {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  autoFocus?: boolean
  className?: string
}

const OTP_LENGTH = 5

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  autoFocus = false,
  className,
}: OtpInputProps) {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([])
  const digits = React.useMemo(
    () => Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? ""),
    [value]
  )

  React.useEffect(() => {
    if (!autoFocus || disabled) return
    const frame = requestAnimationFrame(() => focusInput(0))
    return () => cancelAnimationFrame(frame)
  }, [autoFocus, disabled])

  function focusInput(index: number) {
    inputRefs.current[index]?.focus()
    inputRefs.current[index]?.select()
  }

  function updateValue(nextDigits: string[]) {
    const next = nextDigits.join("").slice(0, OTP_LENGTH)
    onChange(next)
    if (next.length === OTP_LENGTH) {
      onComplete?.(next)
    }
  }

  function handleChange(index: number, nextValue: string) {
    const digit = normalizeOtpInput(nextValue).slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = digit
    updateValue(nextDigits)

    if (digit && index < OTP_LENGTH - 1) {
      focusInput(index + 1)
    }
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1)
      return
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault()
      focusInput(index - 1)
      return
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault()
      focusInput(index + 1)
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = normalizeOtpInput(event.clipboardData.getData("text"))

    if (!pasted) return

    onChange(pasted)
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1))
    if (pasted.length === OTP_LENGTH) {
      onComplete?.(pasted)
    }
  }

  return (
    <div
      dir="ltr"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element
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
            "size-11 rounded border border-white/18 bg-background text-center text-lg font-light shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] outline-none transition-colors",
            "focus-visible:border-primary",
            invalid && "border-destructive focus-visible:border-destructive",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.currentTarget.select()}
        />
      ))}
    </div>
  )
}
