"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import type { CategoryTree, UpsertCategoryRequest } from "@/types/api";
import { CategoriesAddDialog } from "./categories-add-dialog";
import { CategoriesTable } from "./categories-table";
import { flattenCategories } from "./data";

export function AdminCategories() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const tree = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () =>
      (await api.get<CategoryTree[]>("/api/admin/categories/tree")).data,
  });

  const mapped = useMemo(
    () => flattenCategories(tree.data ?? []),
    [tree.data],
  );

  const create = useMutation({
    mutationFn: async (payload: UpsertCategoryRequest) =>
      (await api.post("/api/admin/categories", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("دسته ایجاد شد");
      setAddOpen(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) =>
      api.delete(`/api/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("دسته حذف شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleActive = useMutation({
    mutationFn: async (category: (typeof mapped)[number]) => {
      const payload: UpsertCategoryRequest = {
        name: category.name,
        slug: category.slug,
        description: category.description ?? null,
        parentId: category.parentId,
        sortOrder: category.sortOrder,
        isActive: !category.isActive,
      };
      return (
        await api.put(`/api/admin/categories/${category.id}`, payload)
      ).data;
    },
    onSuccess: (_data, category) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(
        category.isActive ? "دسته غیرفعال شد" : "دسته فعال شد",
      );
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleDeleteSelected = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) => api.delete(`/api/admin/categories/${id}`)),
      );
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(`${ids.length} دسته حذف شد`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        {tree.isLoading && <Skeleton className="h-96 w-full rounded-lg" />}
        {tree.isError && (
          <ErrorState
            message={getApiErrorMessage(tree.error)}
            onRetry={() => tree.refetch()}
          />
        )}
        {tree.isSuccess && (
          <CategoriesTable
            data={mapped}
            onAdd={() => setAddOpen(true)}
            onDelete={(id) => remove.mutate(id)}
            onToggleActive={(category) => toggleActive.mutate(category)}
            onDeleteSelected={handleDeleteSelected}
          />
        )}
      </div>

      <CategoriesAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        parents={mapped}
        onSubmit={create.mutateAsync}
        submitting={create.isPending}
      />
    </>
  );
}
