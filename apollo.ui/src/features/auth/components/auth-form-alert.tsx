import { CircleAlertIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type AuthFormAlertProps = {
  message: string
  className?: string
}

export function AuthFormAlert({ message, className }: AuthFormAlertProps) {
  return (
    <Alert
      variant="destructive"
      className={cn(
        "rounded-md px-2.5 py-2 text-start has-[>svg]:gap-x-2 [&>svg]:size-3.5",
        className
      )}
    >
      <CircleAlertIcon />
      <AlertDescription className="text-xs font-light leading-snug">
        {message}
      </AlertDescription>
    </Alert>
  )
}
