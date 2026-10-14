"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { DEFAULT_SHOP_PRIMARY } from "@/lib/shop-primary-color";
import { tenantStorefrontUrl } from "@/lib/tenant";
import type { CreateTenantRequest, CreateTenantResult, TenantDto } from "@/types/api";

const emptyForm: CreateTenantRequest = {
  slug: "",
  name: "",
  adminEmail: "",
  adminPassword: "",
  adminFirstName: "مدیر",
  adminLastName: "فروشگاه",
  shopTitle: "",
  primaryColor: DEFAULT_SHOP_PRIMARY,
};

export function AdminTenants() {
  const queryClient = useQueryClient();
  const isPlatformAdmin = useAuthStore((s) => s.isPlatformAdmin());
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const [form, setForm] = useState<CreateTenantRequest>(emptyForm);
  const [created, setCreated] = useState<CreateTenantResult | null>(null);

  const tenants = useQuery({
    queryKey: ["platform-tenants"],
    queryFn: async () => (await api.get<TenantDto[]>("/api/platform/tenants")).data,
    enabled: isPlatformAdmin,
  });

  const create = useMutation({
    mutationFn: async () =>
      (
        await api.post<CreateTenantResult>("/api/platform/tenants", {
          ...form,
          shopTitle: form.shopTitle || form.name,
        })
      ).data,
    onSuccess: (data) => {
      setCreated(data);
      setForm(emptyForm);
      void queryClient.invalidateQueries({ queryKey: ["platform-tenants"] });
      toast.success(`فروشگاه «${data.name}» ساخته شد`);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    create.mutate();
  }

  if (!isAdmin && !isPlatformAdmin) {
    return (
      <p className="text-sm text-muted-foreground">
        فقط ادمین می‌تواند فروشگاه جدید بسازد.
      </p>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">فروشگاه‌های چندگانه</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          با ساخت tenant جدید، یک نسخهٔ خالی از فروشگاه روی ساب‌دامین همان slug ساخته می‌شود.
        </p>
      </div>

      {created ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
          <p className="font-medium text-emerald-900 dark:text-emerald-100">فروشگاه آماده است</p>
          <ul className="mt-2 space-y-1 text-emerald-800 dark:text-emerald-200">
            <li>اسلاگ: <code dir="ltr">{created.slug}</code></li>
            <li>ایمیل ادمین: <code dir="ltr">{created.adminEmail}</code></li>
            <li>
              آدرس فروشگاه:{" "}
              <a
                className="inline-flex items-center gap-1 underline"
                href={tenantStorefrontUrl(created.slug)}
                target="_blank"
                rel="noreferrer"
              >
                {tenantStorefrontUrl(created.slug)}
                <ExternalLink className="size-3.5" />
              </a>
            </li>
          </ul>
          <p className="mt-2 text-emerald-700 dark:text-emerald-300">
            با همان ایمیل و رمزی که وارد کردید وارد پنل ادمین این فروشگاه شوید.
          </p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-4 rounded-lg border p-4 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Store className="size-4" />
          ساخت فروشگاه جدید
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="slug">اسلاگ ساب‌دامین</Label>
            <Input
              id="slug"
              dir="ltr"
              placeholder="shop2"
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                }))
              }
              required
            />
            <p className="text-xs text-muted-foreground" dir="ltr">
              {form.slug ? tenantStorefrontUrl(form.slug) : "shop2.localhost:3000"}
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="name">نام فروشگاه</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="shopTitle">عنوان نمایشی (اختیاری)</Label>
            <Input
              id="shopTitle"
              value={form.shopTitle ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, shopTitle: e.target.value }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="primaryColor">رنگ اصلی</Label>
            <Input
              id="primaryColor"
              dir="ltr"
              type="color"
              className="h-9 w-full max-w-24 cursor-pointer p-1"
              value={form.primaryColor || DEFAULT_SHOP_PRIMARY}
              onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="adminFirstName">نام ادمین</Label>
            <Input
              id="adminFirstName"
              value={form.adminFirstName}
              onChange={(e) => setForm((f) => ({ ...f, adminFirstName: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="adminLastName">نام خانوادگی ادمین</Label>
            <Input
              id="adminLastName"
              value={form.adminLastName}
              onChange={(e) => setForm((f) => ({ ...f, adminLastName: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="adminEmail">ایمیل ادمین</Label>
            <Input
              id="adminEmail"
              dir="ltr"
              type="email"
              value={form.adminEmail}
              onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="adminPassword">رمز ادمین</Label>
            <Input
              id="adminPassword"
              dir="ltr"
              type="password"
              autoComplete="new-password"
              value={form.adminPassword}
              onChange={(e) => setForm((f) => ({ ...f, adminPassword: e.target.value }))}
              required
              minLength={8}
            />
          </div>
        </div>

        <Button type="submit" disabled={create.isPending} className="w-fit">
          {create.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          ساخت فروشگاه
        </Button>
      </form>

      {isPlatformAdmin ? (
        <div className="grid gap-3">
          <h2 className="text-sm font-medium">همهٔ فروشگاه‌ها</h2>
          {tenants.isLoading ? (
            <p className="text-sm text-muted-foreground">در حال بارگذاری…</p>
          ) : tenants.isError ? (
            <p className="text-sm text-destructive">{getApiErrorMessage(tenants.error)}</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {(tenants.data ?? []).map((t) => (
                <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    <div className="text-muted-foreground" dir="ltr">
                      {t.slug}
                      {!t.isActive ? " · غیرفعال" : ""}
                    </div>
                  </div>
                  <a
                    className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                    href={tenantStorefrontUrl(t.slug)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    مشاهده
                    <ExternalLink className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
