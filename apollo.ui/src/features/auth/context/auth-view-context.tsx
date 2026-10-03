import * as React from "react"

export type AuthView =
  | "login"
  | "register"
  | "login-phone"
  | "register-phone"
  | "forgot-password"

type AuthViewContextValue = {
  view: AuthView
  setView: (view: AuthView) => void
}

const AuthViewContext = React.createContext<AuthViewContextValue | null>(null)

export function AuthViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = React.useState<AuthView>("login")

  const value = React.useMemo(() => ({ view, setView }), [view])

  return (
    <AuthViewContext.Provider value={value}>{children}</AuthViewContext.Provider>
  )
}

export function useAuthView() {
  const context = React.useContext(AuthViewContext)
  if (!context) {
    throw new Error("useAuthView must be used within AuthViewProvider")
  }
  return context
}
