"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingField } from "@/components/ui/floating-field";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { resolveProductImageUrl } from "@/lib/product-image";
import { uploadShopAsset } from "@/lib/shop-settings-api";
import { cn, formatPrice } from "@/lib/utils";
import type {
  Brand,
  PagedResult,
  ProductListItem,
  UpsertBrandRequest,
} from "@/types/api";

const PRODUCTS_PAGE_SIZE = 5;

function slugSanitize(value: string) {
  return value.replace(/\s+/g, "-");
}

function slugFromName(name: string) {
  return name.trim().replace(/\s+/g, "-");
}

function statusBadge(status: ProductListItem["status"]) {
  if (status === 1) return { label: "فعال", variant: "success" as const };
  if (status === 2) return { label: "آرشیو", variant: "secondary" as const };
  return { label: "پیش‌نویس", variant: "warning" as const };
}

type FormState = {
  name: string;
  slug: string;
  description: string;
  imagePath: string;
  isActive: boolean;
};

export function AdminBrandEdit() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [productsPage, setProductsPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brand = useQuery({
    queryKey: ["admin-brand", id],
    queryFn: async () =>
      (await api.get<Brand>(`/api/admin/brands/${id}`)).data,
    enabled: Boolean(id),
  });

  const products = useQuery({
    queryKey: ["admin-brand-products", brand.data?.slug, productsPage],
    queryFn: async () =>
      (
        await api.get<PagedResult<ProductListItem>>("/api/admin/products", {
          params: {
            page: productsPage,
            pageSize: PRODUCTS_PAGE_SIZE,
            brand: brand.data!.slug,
          },
        })
      ).data,
    enabled: Boolean(brand.data?.slug),
  });

  useEffect(() => {
    if (!brand.data) return;
    setForm({
      name: brand.data.name,
      slug: brand.data.slug,
      description: brand.data.description ?? "",
      imagePath: brand.data.imagePath ?? "",
      isActive: brand.data.isActive,
    });
    setError(null);
    setProductsPage(1);
  }, [brand.data]);

  const save = useMutation({
    mutationFn: async (payload: UpsertBrandRequest) =>
      (await api.put<Brand>(`/api/admin/brands/${id}`, payload)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(["admin-brand", id], data);
      void queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin-brand-products"],
      });
      toast.success("تغییرات ذخیره شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const uploadImage = async (file: File | undefined) => {
    if (!file || !form) return;
    setUploading(true);
    try {
      const result = await uploadShopAsset(file, "shop");
      setForm((f) => (f ? { ...f, imagePath: result.url } : f));
      toast.success("تصویر آپلود شد");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "آپلود ناموفق بود"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(null);

    if (!form.name.trim()) {
      setError("نام برند الزامی است.");
      return;
    }

    await save.mutateAsync({
      name: form.name.trim(),
      slug: form.slug.trim() || slugFromName(form.name),
      description: form.description.trim() || null,
      imagePath: form.imagePath.trim() || null,
      isActive: form.isActive,
    });
  };

  if (brand.isLoading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (brand.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(brand.error)}
        onRetry={() => brand.refetch()}
      />
    );
  }

  if (!form) return null;

  const totalPages = Math.max(products.data?.totalPages ?? 1, 1);
  const productItems = products.data?.items ?? [];

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2 text-muted-foreground"
          render={<Link href="/admin/brands" />}
        >
          <ArrowRight className="size-4" />
          بازگشت به لیست
        </Button>
      </div>

      <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
        <h2 className="text-base font-semibold tracking-tight">جزئیات برند</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <FloatingField
            label="نام"
            required
            value={form.name}
            onChange={(value) => setForm((f) => (f ? { ...f, name: value } : f))}
          />
          <FloatingField
            label="اسلاگ"
            dir="ltr"
            value={form.slug}
            onChange={(value) =>
              setForm((f) => (f ? { ...f, slug: slugSanitize(value) } : f))
            }
          />
          <FloatingField
            label="توضیحات"
            className="sm:col-span-2 lg:col-span-3 xl:col-span-3"
            value={form.description}
            onChange={(value) =>
              setForm((f) => (f ? { ...f, description: value } : f))
            }
          />
          <div className="flex h-12 items-center justify-between gap-3 rounded-lg border border-input px-3">
            <Label className="mb-0 text-sm font-normal text-muted-foreground">
              وضعیت فعال
            </Label>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) =>
                setForm((f) => (f ? { ...f, isActive: !!v } : f))
              }
            />
          </div>

          <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 transition",
                "hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                uploading && "opacity-70",
              )}
              aria-label="آپلود تصویر برند"
            >
              {form.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveProductImageUrl(form.imagePath)}
                  alt=""
                  className="size-full object-cover"
                />
              ) : uploading ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="size-5 text-muted-foreground" />
              )}
            </button>
            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-medium">تصویر برند</p>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  {form.imagePath ? "تغییر تصویر" : "آپلود تصویر"}
                </Button>
                {form.imagePath ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs"
                    disabled={uploading}
                    onClick={() =>
                      setForm((f) => (f ? { ...f, imagePath: "" } : f))
                    }
                  >
                    حذف
                  </Button>
                ) : null}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              className="hidden"
              onChange={(e) => {
                void uploadImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive sm:col-span-2 lg:col-span-3 xl:col-span-4">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="h-10 rounded-lg px-5"
            disabled={save.isPending || uploading}
          >
            {save.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              "ذخیره تغییرات"
            )}
          </Button>
        </div>
      </form>

      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold tracking-tight">
            محصولات این برند
          </h3>
          {products.data ? (
            <span className="text-sm font-light text-muted-foreground">
              {toPersianDigits(String(products.data.totalCount))} محصول
            </span>
          ) : null}
        </div>

        {products.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: PRODUCTS_PAGE_SIZE }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
            ))}
          </div>
        ) : products.isError ? (
          <ErrorState
            message={getApiErrorMessage(products.error)}
            onRetry={() => products.refetch()}
          />
        ) : productItems.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            <Package className="size-8 opacity-40" />
            محصولی برای این برند ثبت نشده است.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {productItems.map((product) => {
                const badge = statusBadge(product.status);
                return (
                  <article
                    key={product.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <div className="relative aspect-[4/3] bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveProductImageUrl(product.primaryImageUrl)}
                        alt=""
                        className="size-full object-cover"
                      />
                      <Badge
                        variant={badge.variant}
                        className="absolute start-2 top-2"
                      >
                        {badge.label}
                      </Badge>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 p-3">
                      <h4 className="line-clamp-2 text-sm font-medium leading-5">
                        {product.name}
                      </h4>
                      <p className="mt-auto pt-1 text-sm tabular-nums text-primary">
                        {formatPrice(product.basePrice)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2">
              <span className="text-sm tabular-nums text-muted-foreground">
                {toPersianDigits(String(productsPage))} از{" "}
                {toPersianDigits(String(totalPages))}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                disabled={productsPage <= 1 || products.isFetching}
                aria-label="صفحه قبل"
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() =>
                  setProductsPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={productsPage >= totalPages || products.isFetching}
                aria-label="صفحه بعد"
              >
                <ChevronLeft className="size-4" />
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
