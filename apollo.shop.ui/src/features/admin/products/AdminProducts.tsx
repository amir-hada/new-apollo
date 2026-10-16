"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/skeleton";
import { flattenCategories } from "@/features/admin/categories/data";
import { api, getApiErrorMessage } from "@/lib/api";
import type {
  Brand,
  CategoryTree,
  PagedResult,
  ProductDetail,
  ProductListItem,
} from "@/types/api";
import { mapProductRow } from "./data";
import {
  ProductsAddDialog,
  type CreateProductPayload,
} from "./products-add-dialog";
import { ProductsTable } from "./products-table";

export function AdminProducts() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () =>
      (
        await api.get<PagedResult<ProductListItem>>("/api/admin/products", {
          params: { page: 1, pageSize: 100 },
        })
      ).data,
  });

  const categoriesTree = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () =>
      (await api.get<CategoryTree[]>("/api/admin/categories/tree")).data,
  });

  const brands = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () =>
      (await api.get<Brand[]>("/api/admin/brands")).data,
  });

  const mapped = useMemo(
    () => (products.data?.items ?? []).map(mapProductRow),
    [products.data?.items],
  );

  const categories = useMemo(
    () => flattenCategories(categoriesTree.data ?? []),
    [categoriesTree.data],
  );

  const create = useMutation({
    mutationFn: async (payload: CreateProductPayload) =>
      (await api.post<ProductDetail>("/api/admin/products", payload)).data,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("محصول ایجاد شد — می‌توانید ویژگی‌ها را کامل کنید");
      setAddOpen(false);
      if (created?.id) {
        router.push(`/admin/products/${created.id}`);
      }
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("محصول حذف شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleDeleteSelected = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => api.delete(`/api/admin/products/${id}`)));
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success(`${ids.length} محصول حذف شد`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        {products.isLoading && <Skeleton className="h-96 w-full rounded-lg" />}
        {products.isError && (
          <ErrorState
            message={getApiErrorMessage(products.error)}
            onRetry={() => products.refetch()}
          />
        )}
        {products.isSuccess && (
          <ProductsTable
            data={mapped}
            onAdd={() => setAddOpen(true)}
            onDelete={(id) => remove.mutate(id)}
            onDeleteSelected={handleDeleteSelected}
          />
        )}
      </div>

      <ProductsAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        categories={categories}
        brands={brands.data ?? []}
        onSubmit={create.mutateAsync}
        submitting={create.isPending}
      />
    </>
  );
}
