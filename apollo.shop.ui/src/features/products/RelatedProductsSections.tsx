"use client";

import { useQueries } from "@tanstack/react-query";
import { HomeProductCarousel } from "@/features/home/HomeProductCarousel";
import { api } from "@/lib/api";
import type { PagedResult, ProductDetail, ProductListItem } from "@/types/api";

type RelatedProductsSectionsProps = {
  product: ProductDetail;
};

async function fetchProducts(params: Record<string, string | number | undefined>) {
  const { data } = await api.get<PagedResult<ProductListItem>>("/api/products", {
    params: { page: 1, pageSize: 16, ...params },
  });
  return data.items ?? [];
}

function excludeCurrent(items: ProductListItem[], productId: string) {
  return items.filter((p) => p.id !== productId);
}

export function RelatedProductsSections({ product }: RelatedProductsSectionsProps) {
  const categorySlug = product.categorySlug?.trim() || undefined;
  const brandKey =
    product.brandSlug?.trim() || product.brandName?.trim() || undefined;

  const [relatedQuery, categoryQuery, brandQuery] = useQueries({
    queries: [
      {
        queryKey: [
          "related-products",
          "related",
          categorySlug ?? "all",
          product.id,
        ],
        queryFn: async () => {
          // Prefer same category; if too few, fall back to featured storewide.
          if (categorySlug) {
            const fromCat = excludeCurrent(
              await fetchProducts({ categorySlug, sort: "featured" }),
              product.id,
            );
            if (fromCat.length >= 2) return fromCat;
          }
          return excludeCurrent(
            await fetchProducts({ sort: "featured" }),
            product.id,
          );
        },
      },
      {
        queryKey: ["related-products", "category", categorySlug, product.id],
        queryFn: () =>
          fetchProducts({ categorySlug, sort: "newest" }).then((items) =>
            excludeCurrent(items, product.id),
          ),
        enabled: Boolean(categorySlug),
      },
      {
        queryKey: ["related-products", "brand", brandKey, product.id],
        queryFn: () =>
          fetchProducts({ brand: brandKey, sort: "newest" }).then((items) =>
            excludeCurrent(items, product.id),
          ),
        enabled: Boolean(brandKey),
      },
    ],
  });

  const relatedItems = relatedQuery.data ?? [];
  const categoryItems = categoryQuery.data ?? [];
  const brandItems = brandQuery.data ?? [];

  const categoryOnlyItems = categoryItems.filter(
    (p) => !relatedItems.some((r) => r.id === p.id),
  );

  const isLoading =
    relatedQuery.isLoading ||
    (Boolean(categorySlug) && categoryQuery.isLoading) ||
    (Boolean(brandKey) && brandQuery.isLoading);

  if (isLoading) {
    return (
      <div className="mt-8 border-t border-[#e0e0e2] px-1 py-8 text-sm text-muted-foreground dark:border-white/10">
        در حال بارگذاری محصولات مرتبط…
      </div>
    );
  }

  if (!relatedItems.length && !categoryItems.length && !brandItems.length) {
    return null;
  }

  return (
    <div className="mt-8 space-y-1 border-t border-[#e0e0e2] pt-2 dark:border-white/10 sm:mt-10">
      {relatedItems.length > 0 ? (
        <HomeProductCarousel
          title="محصولات مرتبط"
          subtitle={
            product.categoryName
              ? `پیشنهادهایی نزدیک به «${product.name}»`
              : undefined
          }
          href={
            categorySlug
              ? `/products?category=${encodeURIComponent(categorySlug)}`
              : "/products"
          }
          products={relatedItems}
        />
      ) : null}

      {categoryItems.length > 0 ? (
        <HomeProductCarousel
          title={
            product.categoryName
              ? `محصولات دسته ${product.categoryName}`
              : "محصولات همین دسته‌بندی"
          }
          subtitle="سایر کالاهای همین دسته‌بندی"
          href={
            categorySlug
              ? `/products?category=${encodeURIComponent(categorySlug)}`
              : "/products"
          }
          products={
            categoryOnlyItems.length > 0 ? categoryOnlyItems : categoryItems
          }
        />
      ) : null}

      {brandItems.length > 0 ? (
        <HomeProductCarousel
          title={
            product.brandName
              ? `محصولات برند ${product.brandName}`
              : "محصولات همین برند"
          }
          subtitle="کالاهای دیگر از همین برند"
          href={
            brandKey
              ? `/products?brand=${encodeURIComponent(brandKey)}`
              : "/products"
          }
          products={brandItems}
        />
      ) : null}
    </div>
  );
}
