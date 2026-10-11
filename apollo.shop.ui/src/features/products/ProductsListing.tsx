"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownWideNarrow, Filter, Search, X } from "lucide-react";
import { ProductCard, ProductGrid } from "@/components/product/ProductCard";
import { EmptyState, ErrorState, Pagination } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { useShopSettings } from "@/lib/shop-settings-api";
import { cn } from "@/lib/utils";
import type { CategoryTree, PagedResult, ProductListItem } from "@/types/api";

const SORT_OPTIONS = [
  { value: "relevant", label: "مرتبط‌ترین" },
  { value: "most_viewed", label: "پربازدیدترین" },
  { value: "newest", label: "جدیدترین" },
  { value: "best_selling", label: "پرفروش‌ترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "fastest_shipping", label: "سریع‌ترین ارسال" },
  { value: "buyer_suggestion", label: "پیشنهاد خریداران" },
  { value: "featured", label: "منتخب" },
] as const;

function flatCategories(nodes: CategoryTree[] = [], acc: CategoryTree[] = []) {
  for (const n of nodes) {
    acc.push(n);
    if (n.children?.length) flatCategories(n.children, acc);
  }
  return acc;
}

function DigikalaBreadcrumb({
  shopLabel,
  current,
}: {
  shopLabel: string;
  current: string;
}) {
  return (
    <nav aria-label="مسیر صفحه" className="mb-3 sm:mb-4">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[12px] leading-5 text-[#81858b] dark:text-muted-foreground">
        <li className="inline-flex min-w-0 items-center">
          <Link
            href="/"
            className="truncate transition-colors hover:text-primary"
          >
            {shopLabel}
          </Link>
        </li>
        <li aria-hidden className="select-none px-0.5 text-[#a1a3a8]">
          /
        </li>
        <li className="inline-flex min-w-0 items-center">
          <span className="truncate">{current}</span>
        </li>
      </ol>
    </nav>
  );
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
    <div className="space-y-0">
      <div className="space-y-3 border-b border-[#e0e0e2] py-3 dark:border-white/10">
        <button
          type="button"
          className="flex w-full items-center justify-between text-start text-[13px] font-bold text-[#3f4064] dark:text-foreground"
        >
          جستجو
        </button>
        <div className="flex gap-1.5">
          <Input
            id="products-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="نام محصول..."
            className="h-9 text-[13px]"
            onKeyDown={(e) => {
              if (e.key === "Enter") onApplySearch();
            }}
          />
          <Button
            type="button"
            size="icon"
            className="size-9 shrink-0"
            onClick={onApplySearch}
            title="جستجو"
          >
            <Search className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 border-b border-[#e0e0e2] py-3 dark:border-white/10">
        <p className="text-[13px] font-bold text-[#3f4064] dark:text-foreground">
          دسته‌بندی
        </p>
        <div className="max-h-56 space-y-0.5 overflow-y-auto pe-1">
          <button
            type="button"
            onClick={() => setCategorySlug("")}
            className={cn(
              "flex w-full rounded-md px-2 py-1.5 text-start text-[13px] transition-colors",
              !categorySlug
                ? "bg-primary/10 font-medium text-primary"
                : "text-[#3f4064] hover:bg-muted/70 dark:text-foreground",
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
                "flex w-full rounded-md px-2 py-1.5 text-start text-[13px] transition-colors",
                categorySlug === c.slug
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-[#3f4064] hover:bg-muted/70 dark:text-foreground",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 py-3">
        <p className="text-[13px] font-bold text-[#3f4064] dark:text-foreground">
          محدوده قیمت
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            inputMode="numeric"
            placeholder="از"
            className="h-9 text-[13px]"
            dir="ltr"
          />
          <Input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            inputMode="numeric"
            placeholder="تا"
            className="h-9 text-[13px]"
            dir="ltr"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full text-[13px]"
          onClick={onApplyPrice}
        >
          اعمال قیمت
        </Button>
      </div>
    </div>
  );
}

function ProductsListingContent({
  routeCategorySlug,
}: {
  routeCategorySlug?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const urlCategory = routeCategorySlug ?? searchParams.get("category") ?? "";
  const shopSettings = useShopSettings();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(urlSearch);
  const [q, setQ] = useState(urlSearch);
  const [categorySlug, setCategorySlug] = useState(urlCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("relevant");
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
  const pageTitle =
    activeCategoryName || (q ? `نتایج «${q}»` : "همه محصولات");

  const shopLabel = useMemo(() => {
    const title = shopSettings.data?.shopTitle?.trim() || "آپولو";
    if (title.startsWith("فروشگاه")) return title;
    return `فروشگاه اینترنتی ${title}`;
  }, [shopSettings.data?.shopTitle]);

  const applySearch = () => {
    setPage(1);
    setQ(search.trim());
  };

  const applyPrice = () => setPage(1);

  const changeCategory = (slug: string) => {
    setPage(1);
    if (routeCategorySlug !== undefined) {
      if (!slug) {
        router.push("/products");
        return;
      }
      if (slug !== routeCategorySlug) {
        router.push(`/categories/${slug}`);
        return;
      }
    }
    setCategorySlug(slug);
  };

  const resetFilters = () => {
    setSearch("");
    setQ("");
    setMinPrice("");
    setMaxPrice("");
    setSort("relevant");
    setPage(1);
    if (routeCategorySlug !== undefined) {
      setCategorySlug(routeCategorySlug);
      return;
    }
    setCategorySlug("");
  };

  const totalCountLabel = products.data
    ? `${toPersianDigits(String(products.data.totalCount))} کالا`
    : null;

  const hasActiveFilters = Boolean(
    q ||
      minPrice ||
      maxPrice ||
      (routeCategorySlug === undefined && categorySlug),
  );

  return (
    <div className="min-h-[70vh] bg-background">
      <div className="w-full px-[5px] pt-3 sm:pt-4 lg:pt-3">
        <DigikalaBreadcrumb shopLabel={shopLabel} current={pageTitle} />
        <h1 className="sr-only">{pageTitle}</h1>

        <div className="grid lg:grid-cols-7 lg:items-start">
          <aside
            className={cn(
              "hidden lg:col-span-1 lg:flex lg:flex-col",
              "lg:sticky lg:top-[var(--site-header-height,0px)]",
              "lg:z-30 lg:h-[calc(100svh-var(--site-header-height,0px))]",
              "lg:self-start lg:overflow-hidden",
              "lg:border-e lg:border-[#e0e0e2] lg:bg-background dark:lg:border-white/10",
            )}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#e0e0e2] px-3 py-3 dark:border-white/10">
              <span className="text-[14px] font-bold text-[#3f4064] dark:text-foreground">
                فیلترها
              </span>
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className={cn(
                  "text-[12px] font-medium transition-colors",
                  hasActiveFilters
                    ? "text-primary hover:opacity-80"
                    : "cursor-default text-[#c0c2c5]",
                )}
              >
                حذف فیلترها
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
              <FiltersPanel
                search={search}
                setSearch={setSearch}
                categorySlug={categorySlug}
                setCategorySlug={changeCategory}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                categories={categoryList}
                onApplySearch={applySearch}
                onApplyPrice={applyPrice}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-6">
            <div className="flex items-stretch gap-2 border-b border-[#e0e0e2] bg-background ps-3 pe-2 dark:border-white/10 sm:gap-3 sm:ps-4">
              <div className="flex min-w-0 flex-1 items-stretch gap-3 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4">
                <span className="inline-flex shrink-0 items-center gap-2 py-3 text-[13px] font-bold text-[#3f4064] dark:text-foreground">
                  <ArrowDownWideNarrow
                    className="size-[18px] shrink-0 text-[#9e9fb1] dark:text-muted-foreground"
                    strokeWidth={2}
                  />
                  <span>مرتب‌سازی:</span>
                </span>
                <nav
                  aria-label="مرتب‌سازی محصولات"
                  className="flex items-stretch gap-3 sm:gap-4"
                >
                  {SORT_OPTIONS.map((opt) => {
                    const active = sort === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSort(opt.value);
                          setPage(1);
                        }}
                        className={cn(
                          "relative shrink-0 py-3 text-[13px] transition-colors",
                          active
                            ? "font-medium text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-primary"
                            : "text-[#81858b] hover:text-[#3f4064] dark:text-muted-foreground dark:hover:text-foreground",
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="flex shrink-0 items-center gap-2 py-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                >
                  <Filter className="size-3.5" />
                  فیلترها
                </Button>
                {totalCountLabel ? (
                  <span className="text-[12px] leading-none text-[#81858b] dark:text-muted-foreground">
                    {totalCountLabel}
                  </span>
                ) : null}
              </div>
            </div>

            {products.isLoading && (
              <ProductGrid>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="border-b border-e border-[#e0e0e2] bg-background p-3 dark:border-white/10"
                  >
                    <Skeleton className="mb-3 aspect-square w-full" />
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

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="بستن فیلتر"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-[#e0e0e2] bg-background p-0 shadow-xl dark:border-white/10">
            <div className="flex items-center justify-between gap-2 border-b border-[#e0e0e2] px-4 py-3 dark:border-white/10">
              <div className="flex items-center gap-3">
                <p className="text-[14px] font-bold text-[#3f4064] dark:text-foreground">
                  فیلترها
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className={cn(
                    "text-[12px] font-medium",
                    hasActiveFilters
                      ? "text-primary"
                      : "cursor-default text-[#c0c2c5]",
                  )}
                >
                  حذف فیلترها
                </button>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => setFiltersOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="px-4 pb-4">
              <FiltersPanel
                search={search}
                setSearch={setSearch}
                categorySlug={categorySlug}
                setCategorySlug={(v) => {
                  changeCategory(v);
                  setFiltersOpen(false);
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
        </div>
      ) : null}
    </div>
  );
}

function ListingFallback() {
  return (
    <div className="min-h-[70vh] bg-background">
      <div className="w-full space-y-4 px-[5px] py-6">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-[3/4] rounded-none border-b border-e border-[#e0e0e2]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductsListing({
  routeCategorySlug,
}: {
  routeCategorySlug?: string;
}) {
  return (
    <Suspense fallback={<ListingFallback />}>
      <ProductsListingContent routeCategorySlug={routeCategorySlug} />
    </Suspense>
  );
}
