import { Field, FieldError } from "@/components/ui/field"
import { FloatingLabelInput } from "@/features/auth/components/floating-label-input"
import { authFormFieldErrorClass } from "@/features/auth/lib/auth-form-styles"
import { cn } from "@/lib/utils"

const settingsInputClass = "h-12 text-xs font-light"
const settingsLabelClass =
  "text-xs font-light peer-focus:text-xs peer-focus:leading-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:leading-4"

type SettingsFormFieldProps = Omit<
  React.ComponentProps<typeof FloatingLabelInput>,
  "invalid"
> & {
  error?: string | null
}

export function SettingsFormField({
  error,
  className,
  inputClassName,
  labelClassName,
  ...inputProps
}: SettingsFormFieldProps) {
  return (
    <Field data-invalid={Boolean(error)} className="gap-1.5">
      <FloatingLabelInput
        invalid={Boolean(error)}
        className={className}
        inputClassName={cn(settingsInputClass, inputClassName)}
        labelClassName={cn(settingsLabelClass, labelClassName)}
        {...inputProps}
      />
      {error ? (
        <FieldError className={authFormFieldErrorClass}>{error}</FieldError>
      ) : null}
    </Field>
  )
}
