import * as React from "react"

import { FloatingLabelInput } from "@/features/auth/components/floating-label-input"
import { FloatingLabelTextarea } from "@/components/shared/floating-label-textarea"
import { Field, FieldError } from "@/components/ui/field"
import { authFormFieldErrorClass } from "@/features/auth/lib/auth-form-styles"

type FormFloatingFieldProps = Omit<
  React.ComponentProps<typeof FloatingLabelInput>,
  "invalid" | "label"
> & {
  label: string
  required?: boolean
  error?: string | null
  footer?: React.ReactNode
}

function RequiredLabel({ label }: { label: string }) {
  return (
    <>
      {label}
      <span className="text-destructive"> *</span>
    </>
  )
}

export function FormFloatingField({
  label,
  required = false,
  error,
  footer,
  className,
  ...inputProps
}: FormFloatingFieldProps) {
  const displayLabel = required ? <RequiredLabel label={label} /> : label

  return (
    <Field data-invalid={Boolean(error)} className="gap-1">
      <FloatingLabelInput
        label={displayLabel}
        invalid={Boolean(error)}
        className={className}
        {...inputProps}
      />
      {footer}
      {error ? (
        <FieldError className={authFormFieldErrorClass}>{error}</FieldError>
      ) : null}
    </Field>
  )
}

type FormFloatingTextareaFieldProps = Omit<
  React.ComponentProps<typeof FloatingLabelTextarea>,
  "invalid" | "label"
> & {
  label: string
  required?: boolean
  error?: string | null
}

export function FormFloatingTextareaField({
  label,
  required = false,
  error,
  className,
  ...textareaProps
}: FormFloatingTextareaFieldProps) {
  const displayLabel = required ? <RequiredLabel label={label} /> : label

  return (
    <Field data-invalid={Boolean(error)} className="gap-1">
      <FloatingLabelTextarea
        label={displayLabel}
        invalid={Boolean(error)}
        className={className}
        {...textareaProps}
      />
      {error ? (
        <FieldError className={authFormFieldErrorClass}>{error}</FieldError>
      ) : null}
    </Field>
  )
}
