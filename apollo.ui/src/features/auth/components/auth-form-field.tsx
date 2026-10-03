import { Field, FieldError } from "@/components/ui/field"
import { FloatingLabelInput } from "@/features/auth/components/floating-label-input"
import { authFormFieldErrorClass } from "@/features/auth/lib/auth-form-styles"

type AuthFormFieldProps = Omit<
  React.ComponentProps<typeof FloatingLabelInput>,
  "invalid"
> & {
  error?: string | null
  showErrorMessage?: boolean
  footer?: React.ReactNode
}

export function AuthFormField({
  error,
  showErrorMessage = true,
  footer,
  className,
  ...inputProps
}: AuthFormFieldProps) {
  return (
    <Field data-invalid={Boolean(error)} className="gap-1">
      <FloatingLabelInput
        invalid={Boolean(error)}
        className={className}
        {...inputProps}
      />
      {footer}
      {showErrorMessage ? (
        <FieldError className={authFormFieldErrorClass}>{error}</FieldError>
      ) : null}
    </Field>
  )
}
