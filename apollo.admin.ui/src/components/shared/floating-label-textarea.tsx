import * as React from "react"

import {
  authFormLabelClass,
  authFormTextClass,
  authInputFrameClass,
} from "@/features/auth/lib/auth-form-styles"
import { cn } from "@/lib/utils"

type FloatingLabelTextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "placeholder"
> & {
  label: React.ReactNode
  invalid?: boolean
  textareaClassName?: string
  labelClassName?: string
}

export function FloatingLabelTextarea({
  id,
  label,
  className,
  invalid,
  textareaClassName,
  labelClassName,
  rows = 3,
  ...props
}: FloatingLabelTextareaProps) {
  return (
    <div
      className={cn(
        "group/field relative rounded",
        authInputFrameClass,
        className
      )}
    >
      <textarea
        id={id}
        data-slot="textarea"
        rows={rows}
        placeholder=" "
        aria-invalid={invalid || undefined}
        className={cn(
          "peer min-h-20 w-full min-w-0 resize-none rounded border-0 bg-transparent px-3 pt-4 pb-2 outline-none",
          authFormTextClass,
          "placeholder:text-transparent",
          "focus-visible:ring-0",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          textareaClassName
        )}
        {...props}
      />
      <fieldset
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 -top-[5px] bottom-0 rounded border border-white/18 px-2 transition-colors",
          "group-focus-within/field:border-primary",
          invalid && "border-destructive group-focus-within/field:border-destructive"
        )}
      >
        <legend
          className={cn(
            "invisible h-[11px] max-w-[0.01px] p-0 text-[11px] whitespace-nowrap transition-[max-width] duration-150",
            "group-focus-within/field:max-w-full",
            "group-has-[textarea:not(:placeholder-shown)]/field:max-w-full"
          )}
        >
          <span className="inline-block px-1">{label}</span>
        </legend>
      </fieldset>
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute start-3 top-4 z-10 max-w-[calc(100%-1.5rem)] truncate transition-all duration-200",
          authFormLabelClass,
          "peer-focus:start-2 peer-focus:top-0 peer-focus:px-1 peer-focus:text-[11px] peer-focus:leading-4 peer-focus:text-primary",
          "peer-[:not(:placeholder-shown)]:start-2 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-[11px] peer-[:not(:placeholder-shown)]:leading-4",
          invalid &&
            "peer-focus:text-destructive peer-[:not(:placeholder-shown)]:text-destructive",
          labelClassName
        )}
      >
        {label}
      </label>
    </div>
  )
}
