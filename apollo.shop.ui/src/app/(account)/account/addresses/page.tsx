"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, MoreVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import { AddressFormDialog } from "@/features/account/AddressFormDialog";
import { ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Address, UpsertAddressRequest } from "@/types/api";

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const addresses = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await api.get<Address[]>("/api/addresses")).data,
  });

  const save = useMutation({
    mutationFn: async (payload: UpsertAddressRequest) => {
      if (editing) {
        return (await api.put<Address>(`/api/addresses/${editing.id}`, payload)).data;
      }
      return (await api.post<Address>("/api/addresses", payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setFormOpen(false);
      setEditing(null);
      toast.success(editing ? "آدرس به‌روز شد" : "آدرس ثبت شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "ذخیره آدرس ناموفق بود")),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("آدرس حذف شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const setDefault = useMutation({
    mutationFn: async (id: string) => api.post(`/api/addresses/${id}/default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("آدرس پیش‌فرض تنظیم شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    setFormOpen(true);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <div>
          <h1 className="relative inline-block text-[15px] font-bold">
            آدرس‌ها
            <span className="absolute inset-x-0 -bottom-3.5 h-0.5 rounded-full bg-primary" />
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <Plus className="size-4" />
          افزودن آدرس جدید
        </button>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        {addresses.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        )}

        {addresses.isError && (
          <ErrorState
            message={getApiErrorMessage(addresses.error)}
            onRetry={() => addresses.refetch()}
          />
        )}

        {!addresses.isLoading && !addresses.isError && (
          <>
            <h2 className="text-sm font-bold text-foreground">آدرس‌های من</h2>

            {addresses.data?.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
                <MapPin className="mx-auto size-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">هنوز آدرسی ثبت نکرده‌اید</p>
                <Button type="button" className="mt-4 h-10 rounded-xl" onClick={openCreate}>
                  <Plus className="size-4" />
                  افزودن اولین آدرس
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {addresses.data?.map((a) => (
                  <article
                    key={a.id}
                    className={cn(
                      "relative rounded-xl border bg-card p-4 transition",
                      a.isDefault
                        ? "border-sky-400 ring-1 ring-sky-400/30"
                        : "border-border",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <MapPin className="size-4 shrink-0 text-sky-500" />
                          <h3 className="text-sm font-bold text-foreground">{a.title}</h3>
                          {a.isDefault ? (
                            <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-700 dark:text-sky-300">
                              پیش‌فرض
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-2 text-sm leading-7 text-muted-foreground">
                          {a.province}، {a.city}، {a.line1}
                          {a.line2 ? `، ${a.line2}` : ""}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          کدپستی: {toPersianDigits(a.postalCode)}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          گیرنده: {a.fullName}{" "}
                          <span className="text-border">|</span>{" "}
                          <span dir="ltr" className="inline-block">
                            {toPersianDigits(a.phone)}
                          </span>
                        </p>
                      </div>

                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0 rounded-lg data-[popup-open]:bg-muted"
                              aria-label="عملیات آدرس"
                            />
                          }
                        >
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-40">
                          <DropdownMenuItem onClick={() => openEdit(a)}>
                            ویرایش
                          </DropdownMenuItem>
                          {!a.isDefault ? (
                            <DropdownMenuItem onClick={() => setDefault.mutate(a.id)}>
                              تنظیم به‌عنوان پیش‌فرض
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              if (window.confirm("این آدرس حذف شود؟")) {
                                remove.mutate(a.id);
                              }
                            }}
                          >
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AddressFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        title={editing ? "ویرایش آدرس" : "افزودن آدرس جدید"}
        submitting={save.isPending}
        initial={
          editing
            ? {
                title: editing.title,
                fullName: editing.fullName,
                phone: editing.phone,
                province: editing.province,
                city: editing.city,
                postalCode: editing.postalCode,
                line1: editing.line1,
                line2: editing.line2 ?? "",
                isDefault: editing.isDefault,
              }
            : null
        }
        onSubmit={(data) => save.mutate(data)}
      />
    </div>
  );
}
