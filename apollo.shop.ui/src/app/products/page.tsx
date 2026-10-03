"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard, ProductGrid } from "@/components/product/ProductCard";
import { EmptyState, ErrorState, Pagination } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CategoryTree, PagedResult, ProductListItem } from "@/types/api";

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
] as const;

function flatCategories(nodes: CategoryTree[] = [], acc: CategoryTree[] = []) {
  for (const n of nodes) {
    acc.push(n);
    if (n.children?.length) flatCategories(n.children, acc);
  }
  return acc;
}

function FiltersPanel({
  search,
  setSearch,
  categorySlug,
  setCategorySlug,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  categories,
  onApplySearch,
  onApplyPrice,
  onReset,
}: {
  search: string;
  setSearch: (v: string) => void;
  categorySlug: string;
  setCategorySlug: (v: string) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  categories: CategoryTree[];
  onApplySearch: () => void;
  onApplyPrice: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="products-search" className="text-xs text-muted-foreground">
          جستجو در نتایج
        </Label>
        <div className="flex gap-1.5">
          <Input
            id="products-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="نام محصول..."
            className="h-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") onApplySearch();
            }}
          />
          <Button
            type="button"
            size="icon"
            className="size-10 shrink-0"
            onClick={onApplySearch}
            title="جستجو"
          >
            <Search className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">دسته‌بندی</p>
        <div className="max-h-56 space-y-0.5 overflow-y-auto pe-1">
          <button
            type="button"
            onClick={() => setCategorySlug("")}
            className={cn(
              "flex w-full rounded-lg px-2.5 py-2 text-start text-sm transition-colors",
              !categorySlug
                ? "bg-primary/10 font-medium text-primary"
                : "text-foreground/80 hover:bg-muted/70",
            )}
          >
            همه دسته‌ها
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategorySlug(c.slug)}
              className={cn(
                "flex w-full rounded-lg px-2.5 py-2 text-start text-sm transition-colors",
                categorySlug === c.slug
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-foreground/80 hover:bg-muted/70",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">محدوده قیمت</p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            inputMode="numeric"
            placeholder="از"
            className="h-10"
            dir="ltr"
          />
          <Input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            inputMode="numeric"
            placeholder="تا"
            className="h-10"
            dir="ltr"
          />
        </div>
        <Button type="button" variant="outline" className="h-9 w-full" onClick={onApplyPrice}>
          اعمال قیمت
        </Button>
      </div>

      <Button type="button" variant="ghost" className="h-9 w-full gap-1.5 text-muted-foreground" onClick={onReset}>
        <X className="size-3.5" />
        حذف فیلترها
      </Button>
    </div>
  );
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const urlCategory = searchParams.get("category") ?? "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(urlSearch);
  const [q, setQ] = useState(urlSearch);
  const [categorySlug, setCategorySlug] = useState(urlCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setSearch(urlSearch);
    setQ(urlSearch);
    setCategorySlug(urlCategory);
    setPage(1);
  }, [urlSearch, urlCategory]);

  const queryKey = useMemo(
    () => ["products", page, q, categorySlug, minPrice, maxPrice, sort],
    [page, q, categorySlug, minPrice, maxPrice, sort],
  );

  const categories = useQuery({
    queryKey: ["categories-tree"],
    queryFn: async () => (await api.get<CategoryTree[]>("/api/categories/tree")).data,
  });

  const products = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await api.get<PagedResult<ProductListItem>>("/api/products", {
        params: {
          page,
          pageSize: 24,
          search: q || undefined,
          categorySlug: categorySlug || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sort,
        },
      });
      return data;
    },
  });

  const categoryList = flatCategories(categories.data ?? []);
  const activeCategoryName = categoryList.find((c) => c.slug === categorySlug)?.name;

  const applySearch = () => {
    setPage(1);
    setQ(search.trim());
  };

  const applyPrice = () => setPage(1);

  const resetFilters = () => {
    setSearch("");
    setQ("");
    setCategorySlug("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  };

  return (
    <div className="min-h-[70vh] bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6 lg:px-5">
        <div className="mb-4 space-y-1 sm:mb-5">
          <h1 className="text-lg font-bold tracking-tight sm:text-2xl">
            {activeCategoryName || (q ? `نتایج «${q}»` : "همه محصولات")}
          </h1>
          {products.data ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {toPersianDigits(String(products.data.totalCount))} کالا
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
          {/* فیلتر دسکتاپ */}
          <aside className="hidden h-fit rounded-xl border border-[#e0e0e2] bg-background p-4 dark:border-white/10 lg:sticky lg:top-20 lg:block">
            <div className="mb-4 flex items-center gap-1.5 text-sm font-semibold">
              <Filter className="size-4 text-muted-foreground" />
              فیلترها
            </div>
            <FiltersPanel
              search={search}
              setSearch={setSearch}
              categorySlug={categorySlug}
              setCategorySlug={(v) => {
                setCategorySlug(v);
                setPage(1);
              }}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              categories={categoryList}
              onApplySearch={applySearch}
              onApplyPrice={applyPrice}
              onReset={resetFilters}
            />
          </aside>

          <div className="min-w-0 space-y-3">
            {/* نوار مرتب‌سازی + فیلتر موبایل */}
            <div className="flex flex-col gap-2 rounded-xl border border-[#e0e0e2] bg-background px-2.5 py-2 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between sm:px-3">
              <div className="flex items-center gap-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="me-1 hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                  <SlidersHorizontal className="size-3.5" />
                  مرتب‌سازی:
                </span>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSort(opt.value);
                      setPage(1);
                    }}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors sm:text-[13px]",
                      sort === opt.value
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 lg:hidden"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter className="size-3.5" />
                فیلترها
              </Button>
            </div>

            {products.isLoading && (
              <ProductGrid>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="border-b border-e border-[#e0e0e2] bg-background p-3 dark:border-white/10">
                    <Skeleton className="mb-3 aspect-square w-full rounded-md" />
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="mb-2 h-3 w-1/2" />
                    <Skeleton className="ms-auto h-5 w-24" />
                  </div>
                ))}
              </ProductGrid>
            )}

            {products.isError && (
              <div className="rounded-xl border border-border/80 bg-card p-4">
                <ErrorState
                  message={getApiErrorMessage(products.error)}
                  onRetry={() => products.refetch()}
                />
              </div>
            )}

            {products.data && products.data.items.length === 0 && (
              <div className="rounded-xl border border-border/80 bg-card p-6">
                <EmptyState
                  title="محصولی یافت نشد"
                  description="فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید."
                />
              </div>
            )}

            {products.data && products.data.items.length > 0 && (
              <>
                <ProductGrid>
                  {products.data.items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </ProductGrid>
                <div className="flex justify-center pt-2 pb-4">
                  <Pagination
                    page={products.data.page}
                    totalPages={products.data.totalPages}
                    onChange={setPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* شیت فیلتر موبایل */}
      {filtersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="بستن فیلتر"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-border bg-card p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">فیلترها</p>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => setFiltersOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <FiltersPanel
              search={search}
              setSearch={setSearch}
              categorySlug={categorySlug}
              setCategorySlug={(v) => {
                setCategorySlug(v);
                setPage(1);
              }}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              categories={categoryList}
              onApplySearch={() => {
                applySearch();
                setFiltersOpen(false);
              }}
              onApplyPrice={() => {
                applyPrice();
                setFiltersOpen(false);
              }}
              onReset={() => {
                resetFilters();
                setFiltersOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] bg-background">
          <div className="mx-auto w-full max-w-[1600px] space-y-4 px-4 py-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="grid grid-cols-2 border-s border-t border-[#e0e0e2] md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-none border-b border-e border-[#e0e0e2]" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
