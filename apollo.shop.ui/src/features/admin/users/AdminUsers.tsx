"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import type { PagedResult, UserListItem } from "@/types/api";
import type { User, UserRole } from "./types";
import type { CreateUserPayload } from "./users-action-dialog";
import { UsersDialogs } from "./users-dialogs";
import { UsersPrimaryButtons } from "./users-primary-buttons";
import { UsersProvider } from "./users-provider";
import { UsersTable } from "./users-table";

function mapUser(item: UserListItem): User {
  const roleRaw = item.roles[0]?.toLowerCase() || "customer";
  const role: UserRole =
    roleRaw === "admin" || roleRaw === "superadmin" ? "admin" : "customer";

  return {
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    username: item.email.split("@")[0] || item.email,
    email: item.email,
    phoneNumber: item.phoneNumber || "",
    status: item.isActive ? "active" : "inactive",
    role,
    isActive: item.isActive,
    createdAtUtc: item.createdAtUtc,
    lastLoginAtUtc: item.lastLoginAtUtc,
    roles: item.roles,
  };
}

export function AdminUsers() {
  const queryClient = useQueryClient();

  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () =>
      (
        await api.get<PagedResult<UserListItem>>("/api/admin/users", {
          params: { page: 1, pageSize: 100 },
        })
      ).data,
  });

  const mapped = useMemo(
    () => (users.data?.items ?? []).map(mapUser),
    [users.data?.items],
  );

  const create = useMutation({
    mutationFn: async (payload: CreateUserPayload) =>
      (await api.post("/api/admin/users", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("کاربر ایجاد شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deactivate = useMutation({
    mutationFn: async (id: string) =>
      api.post(`/api/admin/users/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("کاربر غیرفعال شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleCreated = async (payload: CreateUserPayload) => {
    await create.mutateAsync(payload);
  };

  const handleDeactivated = async (user: User) => {
    if (!user.isActive) {
      toast.message("حذف کاربر فعلاً از طریق API در دسترس نیست");
      return;
    }
    await deactivate.mutateAsync(user.id);
  };

  const handleBulkDeactivate = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => api.post(`/api/admin/users/${id}/deactivate`)));
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(`${ids.length} کاربر غیرفعال شد`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  return (
    <UsersProvider>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        <div className="flex justify-end">
          <UsersPrimaryButtons />
        </div>

        {users.isLoading && <Skeleton className="h-64 w-full" />}
        {users.isError && (
          <ErrorState
            message={getApiErrorMessage(users.error)}
            onRetry={() => users.refetch()}
          />
        )}
        {users.isSuccess && (
          <UsersTable
            data={mapped}
            onDeactivateSelected={handleBulkDeactivate}
          />
        )}
      </div>

      <UsersDialogs
        onCreated={handleCreated}
        onDeactivated={handleDeactivated}
        creating={create.isPending}
        deactivating={deactivate.isPending}
      />
    </UsersProvider>
  );
}
