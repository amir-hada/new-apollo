"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingField } from "@/components/ui/floating-field";
import { FloatingSelect } from "@/components/ui/floating-select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type {
  Category,
  CategoryTree,
  PagedResult,
  ProductListItem,
  UpsertCategoryRequest,
} from "@/types/api";
import { flattenCategories, type CategoryRow } from "./data";

const PRODUCTS_PAGE_SIZE = 5;
const CHILDREN_PAGE_SIZE = 5;

function slugSanitize(value: string) {
  return value.replace(/\s+/g, "-");
}

function slugFromName(name: string) {
  return name.trim().replace(/\s+/g, "-");
}

function excludedParentIds(rows: CategoryRow[], categoryId: string) {
  const excluded = new Set<string>([categoryId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const row of rows) {
      if (row.parentId && excluded.has(row.parentId) && !excluded.has(row.id)) {
        excluded.add(row.id);
        grew = true;
      }
    }
  }
  return excluded;
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
  parentId: string;
  sortOrder: string;
  isActive: boolean;
};

export function AdminCategoryEdit() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [productsPage, setProductsPage] = useState(1);
  const [childrenPage, setChildrenPage] = useState(1);

  const category = useQuery({
    queryKey: ["admin-category", id],
    queryFn: async () =>
      (await api.get<Category>(`/api/admin/categories/${id}`)).data,
    enabled: Boolean(id),
  });

  const tree = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () =>
      (await api.get<CategoryTree[]>("/api/admin/categories/tree")).data,
  });

  const products = useQuery({
    queryKey: ["admin-category-products", category.data?.slug, productsPage],
    queryFn: async () =>
      (
        await api.get<PagedResult<ProductListItem>>("/api/admin/products", {
          params: {
            page: productsPage,
            pageSize: PRODUCTS_PAGE_SIZE,
            categorySlug: category.data!.slug,
          },
        })
      ).data,
    enabled: Boolean(category.data?.slug),
  });

  const rows = useMemo(
    () => flattenCategories(tree.data ?? []),
    [tree.data],
  );

  useEffect(() => {
    if (!category.data) return;
    setForm({
      name: category.data.name,
      slug: category.data.slug,
      description: category.data.description ?? "",
      parentId: category.data.parentId ?? "none",
      sortOrder: String(category.data.sortOrder),
      isActive: category.data.isActive,
    });
    setError(null);
    setProductsPage(1);
    setChildrenPage(1);
  }, [category.data]);

  const childCategories = useMemo(
    () => rows.filter((row) => row.parentId === id),
    [rows, id],
  );

  const childrenTotalPages = Math.max(
    Math.ceil(childCategories.length / CHILDREN_PAGE_SIZE) || 1,
    1,
  );

  const pagedChildren = useMemo(() => {
    const start = (childrenPage - 1) * CHILDREN_PAGE_SIZE;
    return childCategories.slice(start, start + CHILDREN_PAGE_SIZE);
  }, [childCategories, childrenPage]);

  useEffect(() => {
    if (childrenPage > childrenTotalPages) {
      setChildrenPage(childrenTotalPages);
    }
  }, [childrenPage, childrenTotalPages]);

  const parentOptions = useMemo(() => {
    if (!id) return [];
    const excluded = excludedParentIds(rows, id);
    return [
      { value: "none", label: "بدون دسته اصلی" },
      ...rows
        .filter((row) => !excluded.has(row.id))
        .map((row) => ({
          value: row.id,
          label: `${"—".repeat(row.depth)} ${row.name}`.trim(),
        })),
    ];
  }, [rows, id]);

  const save = useMutation({
    mutationFn: async (payload: UpsertCategoryRequest) =>
      (await api.put<Category>(`/api/admin/categories/${id}`, payload)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(["admin-category", id], data);
      void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin-category-products"],
      });
      toast.success("تغییرات ذخیره شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(null);

    if (!form.name.trim()) {
      setError("نام دسته الزامی است.");
      return;
    }

    const sortOrder = Number.parseInt(form.sortOrder, 10);
    if (Number.isNaN(sortOrder)) {
      setError("ترتیب باید عدد باشد.");
      return;
    }

    await save.mutateAsync({
      name: form.name.trim(),
      slug: form.slug.trim() || slugFromName(form.name),
      description: form.description.trim() || null,
      parentId: form.parentId === "none" ? null : form.parentId,
      sortOrder,
      isActive: form.isActive,
    });
  };

  if (category.isLoading || (tree.isLoading && !form)) {
    return (
      <div className="flex w-full flex-col gap-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (category.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(category.error)}
        onRetry={() => category.refetch()}
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
          render={<Link href="/admin/categories" />}
        >
          <ArrowRight className="size-4" />
          بازگشت به لیست
        </Button>
      </div>

      <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit}>
        <h2 className="text-base font-semibold tracking-tight">جزئیات دسته</h2>

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
          <FloatingSelect
            label="دسته اصلی"
            emptyValue="none"
            value={form.parentId}
            onChange={(value) =>
              setForm((f) => (f ? { ...f, parentId: value } : f))
            }
            options={parentOptions}
            searchPlaceholder="جستجو ..."
          />
          <FloatingField
            label="ترتیب"
            dir="ltr"
            value={form.sortOrder}
            onChange={(value) =>
              setForm((f) =>
                f ? { ...f, sortOrder: value.replace(/[^\d-]/g, "") } : f,
              )
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
            disabled={save.isPending}
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

      <div className="grid w-full gap-6 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              محصولات زیرمجموعه
            </h3>
            {products.data ? (
              <span className="text-sm font-light text-muted-foreground">
                {toPersianDigits(String(products.data.totalCount))} محصول
              </span>
            ) : null}
          </div>

          {products.isLoading ? (
            <div className="grid grid-cols-2 gap-3">
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
              محصولی در این دسته ثبت نشده است.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {productItems.map((product) => {
                  const badge = statusBadge(product.status);
                  return (
                    <article
                      key={product.id}
                      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
                    >
                      <div className="relative aspect-[4/3] bg-muted">
                        {product.primaryImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.primaryImageUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <Package className="size-8 text-muted-foreground/50" />
                          </div>
                        )}
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
                        {product.brandName ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {product.brandName}
                          </p>
                        ) : null}
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

        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold tracking-tight">
              دسته‌های زیرمجموعه
            </h3>
            <span className="text-sm font-light text-muted-foreground">
              {toPersianDigits(String(childCategories.length))} دسته
            </span>
          </div>

          {childCategories.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              <FolderTree className="size-8 opacity-40" />
              زیرمجموعه‌ای برای این دسته وجود ندارد.
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                      <th className="h-10 px-3 text-start font-medium">نام</th>
                      <th className="h-10 px-3 text-start font-medium">اسلاگ</th>
                      <th className="h-10 px-3 text-start font-medium">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedChildren.map((child) => (
                      <tr
                        key={child.id}
                        className="border-b border-border last:border-b-0 hover:bg-muted/40"
                      >
                        <td className="px-3 py-2.5">
                          <Link
                            href={`/admin/categories/${child.id}`}
                            className="font-medium text-foreground hover:text-primary hover:underline"
                          >
                            {child.name}
                          </Link>
                        </td>
                        <td
                          className="px-3 py-2.5 text-muted-foreground"
                          dir="ltr"
                        >
                          {child.slug}
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge
                            variant={child.isActive ? "success" : "danger"}
                          >
                            {child.isActive ? "فعال" : "غیرفعال"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2">
                <span className="text-sm tabular-nums text-muted-foreground">
                  {toPersianDigits(String(childrenPage))} از{" "}
                  {toPersianDigits(String(childrenTotalPages))}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setChildrenPage((p) => Math.max(1, p - 1))}
                  disabled={childrenPage <= 1}
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
                    setChildrenPage((p) =>
                      Math.min(childrenTotalPages, p + 1),
                    )
                  }
                  disabled={childrenPage >= childrenTotalPages}
                  aria-label="صفحه بعد"
                >
                  <ChevronLeft className="size-4" />
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
