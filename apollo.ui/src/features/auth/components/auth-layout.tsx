import { Navigate } from "react-router-dom"

import { AuthPage } from "@/features/auth/components/auth-page"
import { HeroAmbientBackground } from "@/features/landing/components/hero-ambient-background"
import { Toaster } from "@/components/ui/sonner"
import { isAuthenticated } from "@/lib/auth/session"

export function AuthLayout() {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden p-6 md:p-10">
      <HeroAmbientBackground />
      <div className="relative z-10 w-full max-w-md">
        <AuthPage />
      </div>
      <Toaster position="top-center" richColors closeButton />
    </div>
  )
}
