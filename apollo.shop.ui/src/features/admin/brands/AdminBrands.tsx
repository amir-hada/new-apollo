"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import type { Brand, UpsertBrandRequest } from "@/types/api";
import { BrandsAddDialog } from "./brands-add-dialog";
import { BrandsTable } from "./brands-table";
import { mapBrand } from "./data";

export function AdminBrands() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);

  const brands = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () =>
      (await api.get<Brand[]>("/api/admin/brands")).data,
  });

  const mapped = useMemo(
    () => (brands.data ?? []).map(mapBrand),
    [brands.data],
  );

  const create = useMutation({
    mutationFn: async (payload: UpsertBrandRequest) =>
      (await api.post("/api/admin/brands", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("برند ایجاد شد");
      setAddOpen(false);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) =>
      api.delete(`/api/admin/brands/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("برند حذف شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleActive = useMutation({
    mutationFn: async (brand: (typeof mapped)[number]) => {
      const payload: UpsertBrandRequest = {
        name: brand.name,
        slug: brand.slug,
        description: brand.description ?? null,
        imagePath: brand.imagePath ?? null,
        isActive: !brand.isActive,
      };
      return (
        await api.put(`/api/admin/brands/${brand.id}`, payload)
      ).data;
    },
    onSuccess: (_data, brand) => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success(
        brand.isActive ? "برند غیرفعال شد" : "برند فعال شد",
      );
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleDeleteSelected = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) => api.delete(`/api/admin/brands/${id}`)),
      );
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success(`${ids.length} برند حذف شد`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      throw err;
    }
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 sm:gap-6">
        {brands.isLoading && <Skeleton className="h-96 w-full rounded-lg" />}
        {brands.isError && (
          <ErrorState
            message={getApiErrorMessage(brands.error)}
            onRetry={() => brands.refetch()}
          />
        )}
        {brands.isSuccess && (
          <BrandsTable
            data={mapped}
            onAdd={() => setAddOpen(true)}
            onDelete={(id) => remove.mutate(id)}
            onToggleActive={(brand) => toggleActive.mutate(brand)}
            onDeleteSelected={handleDeleteSelected}
          />
        )}
      </div>

      <BrandsAddDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={create.mutateAsync}
        submitting={create.isPending}
      />
    </>
  );
}
