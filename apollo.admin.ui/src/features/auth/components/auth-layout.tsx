import { Navigate } from "react-router-dom"

import { AdminLoginForm } from "@/features/auth/components/admin-login-form"
import { AuthAmbientBackground } from "@/features/auth/components/auth-ambient-background"
import { useAuth } from "@/features/auth/context/auth-provider"

export function AuthLayout() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden p-6 md:p-10">
      <AuthAmbientBackground />
      <div className="relative z-10 w-full max-w-md">
        <AdminLoginForm />
      </div>
    </div>
  )
}
