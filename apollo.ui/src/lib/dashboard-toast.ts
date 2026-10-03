import { toast } from "sonner"

export const dashboardToast = {
  success(message: string, description?: string) {
    toast.success(message, { description })
  },

  error(message: string, description?: string) {
    toast.error(message, { description })
  },

  info(message: string, description?: string) {
    toast.info(message, { description })
  },
}
