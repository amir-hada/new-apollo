"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api, getApiErrorMessage } from "@/lib/api";
import type { Address, UpsertAddressRequest } from "@/types/api";

const empty: UpsertAddressRequest = {
  title: "",
  fullName: "",
  phone: "",
  province: "",
  city: "",
  postalCode: "",
  line1: "",
  line2: "",
  isDefault: false,
};

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UpsertAddressRequest>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addresses = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await api.get<Address[]>("/api/addresses")).data,
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editingId) return (await api.put(`/api/addresses/${editingId}`, form)).data;
      return (await api.post("/api/addresses", form)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setForm(empty);
      setEditingId(null);
      toast.success("آدرس ذخیره شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("حذف شد");
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">آدرس‌ها</h1>
      {addresses.isLoading && <Skeleton className="h-40 w-full" />}
      {addresses.isError && (
        <ErrorState message={getApiErrorMessage(addresses.error)} onRetry={() => addresses.refetch()} />
      )}
      {addresses.data?.length === 0 && <EmptyState title="آدرسی ثبت نشده" />}
      <div className="grid gap-3">
        {addresses.data?.map((a) => (
          <div key={a.id} className="rounded-xl border border-border p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{a.title}</p>
              {a.isDefault && <Badge>پیش‌فرض</Badge>}
            </div>
            <p className="mt-2 text-muted-foreground leading-7">
              {a.fullName} · {a.phone}
              <br />
              {a.province}، {a.city}، {a.line1}
              {a.line2 ? `، ${a.line2}` : ""} · {a.postalCode}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingId(a.id);
                  setForm({
                    title: a.title,
                    fullName: a.fullName,
                    phone: a.phone,
                    province: a.province,
                    city: a.city,
                    postalCode: a.postalCode,
                    line1: a.line1,
                    line2: a.line2 || "",
                    isDefault: a.isDefault,
                  });
                }}
              >
                ویرایش
              </Button>
              {!a.isDefault && (
                <Button size="sm" variant="ghost" onClick={() => setDefault.mutate(a.id)}>
                  پیش‌فرض
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => remove.mutate(a.id)}>
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>

      <form
        className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <h2 className="sm:col-span-2 font-semibold">{editingId ? "ویرایش آدرس" : "افزودن آدرس"}</h2>
        {(
          [
            ["title", "عنوان"],
            ["fullName", "نام گیرنده"],
            ["phone", "موبایل"],
            ["province", "استان"],
            ["city", "شهر"],
            ["postalCode", "کد پستی"],
            ["line1", "آدرس"],
            ["line2", "تکمیل آدرس"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className={key.startsWith("line") ? "sm:col-span-2" : undefined}>
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              required={key !== "line2"}
              value={(form[key] as string) || ""}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
          />
          تنظیم به‌عنوان پیش‌فرض
        </label>
        <div className="sm:col-span-2 flex gap-2">
          <Button disabled={save.isPending}>{save.isPending ? "ذخیره..." : "ذخیره آدرس"}</Button>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setForm(empty);
              }}
            >
              انصراف
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
