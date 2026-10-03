import * as React from "react"

import { UsersDataGrid } from "@/features/dashboard/components/users-data-grid"
import { useAdminUserActions } from "@/features/dashboard/hooks/use-admin-user-actions"
import { useAuth } from "@/features/auth/context/auth-provider"
import { adminApi } from "@/lib/api/admin-api"
import type { AdminUserListItem } from "@/lib/api/auth-types"
import { ApiError } from "@/lib/api/client"

export function UsersPage() {
  const { user, logout } = useAuth()
  const [users, setUsers] = React.useState<AdminUserListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true)

    try {
      const result = await adminApi.getUsers()
      setUsers(result)
      setError(null)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }

      setError(
        err instanceof Error ? err.message : "بارگذاری کاربران ناموفق بود."
      )
    } finally {
      setIsLoading(false)
    }
  }, [logout])

  React.useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const {
    requestActivate,
    requestDeactivate,
    requestDelete,
    confirmDialog,
  } = useAdminUserActions({
    currentUserId: user?.userId,
    onSuccess: () => {
      void loadUsers()
    },
  })

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <UsersDataGrid
          users={users}
          isLoading={isLoading}
          error={error}
          currentUserId={user?.userId}
          onActivate={requestActivate}
          onDeactivate={requestDeactivate}
          onDelete={requestDelete}
        />
      </div>
      {confirmDialog}
    </>
  )
}
