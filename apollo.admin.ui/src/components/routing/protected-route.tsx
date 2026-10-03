import { Navigate } from "react-router-dom"

import { useAuth } from "@/features/auth/context/auth-provider"
import { hasAdminRole, isAuthenticated } from "@/lib/auth/session"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (!isAuthenticated() || !hasAdminRole(user)) {
    return <Navigate to="/auth" replace />
  }

  return children
}
