import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      dir="rtl"
      position="top-center"
      offset={16}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-400" />,
        info: <InfoIcon className="size-4 text-sky-400" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-400" />,
        error: <CircleXIcon className="size-4 text-red-400" />,
        loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-xl !border !shadow-xl !shadow-black/30 !backdrop-blur-md !font-sans",
          title: "!text-sm !font-medium",
          description: "!text-xs !font-normal",
          actionButton:
            "!rounded-lg !bg-primary !text-primary-foreground !text-xs !font-normal",
          cancelButton:
            "!rounded-lg !bg-muted !text-muted-foreground !text-xs !font-normal",
          success:
            "!border-emerald-500/40 !bg-emerald-950/90 !text-emerald-50 [&_[data-title]]:!text-emerald-300 [&_[data-description]]:!text-emerald-100/80",
          error:
            "!border-red-500/50 !bg-red-950/95 !text-red-50 [&_[data-title]]:!text-red-400 [&_[data-description]]:!text-red-200/90",
          warning:
            "!border-amber-500/40 !bg-amber-950/90 !text-amber-50 [&_[data-title]]:!text-amber-300",
          info: "!border-sky-500/40 !bg-sky-950/90 !text-sky-50 [&_[data-title]]:!text-sky-300",
        },
      }}
      {...props}
    />
  )
}
