import { FieldDescription } from "@/components/ui/field"
import { cn } from "@/lib/utils"

type AuthFormTermsProps = {
  className?: string
}

export function AuthFormTerms({ className }: AuthFormTermsProps) {
  return (
    <FieldDescription
      className={cn(
        "text-center text-xs font-light text-muted-foreground",
        className
      )}
    >
      با ادامه،{" "}
      <a
        href="#"
        className="font-light text-primary underline underline-offset-4 hover:text-primary/80"
      >
        شرایط استفاده
      </a>{" "}
      و{" "}
      <a
        href="#"
        className="font-light text-primary underline underline-offset-4 hover:text-primary/80"
      >
        حریم خصوصی
      </a>{" "}
      آپولو را می‌پذیرید.
    </FieldDescription>
  )
}
