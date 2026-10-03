import { Navigate } from "react-router-dom"

import { isAuthenticated } from "@/lib/auth/session"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  return children
}
