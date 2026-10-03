"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard, ProductGrid } from "@/components/product/ProductCard";
import { EmptyState, ErrorState, Pagination } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/skeleton";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import type { PagedResult, ProductListItem } from "@/types/api";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [page, setPage] = useState(1);

  const products = useQuery({
    queryKey: ["category-products", slug, page],
    queryFn: async () => {
      const { data } = await api.get<PagedResult<ProductListItem>>("/api/products", {
        params: { page, pageSize: 24, categorySlug: slug },
      });
      return data;
    },
  });

  return (
    <div className="min-h-[70vh] bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-6 sm:px-4 sm:py-8 lg:px-5">
        <div className="mb-5 space-y-1">
          <h1 className="text-lg font-bold sm:text-2xl">دسته: {slug}</h1>
          {products.data ? (
            <p className="text-xs text-muted-foreground sm:text-sm">
              {toPersianDigits(String(products.data.totalCount))} کالا
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">محصولات این دسته‌بندی</p>
          )}
        </div>

        {products.isLoading && (
          <ProductGrid>
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="border-b border-e border-[#e0e0e2] bg-background p-3 dark:border-white/10"
              >
                <Skeleton className="mb-3 aspect-square w-full rounded-md" />
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="ms-auto h-5 w-24" />
              </div>
            ))}
          </ProductGrid>
        )}
        {products.isError && (
          <div className="rounded-xl border border-[#e0e0e2] bg-background p-4 dark:border-white/10">
            <ErrorState
              message={getApiErrorMessage(products.error)}
              onRetry={() => products.refetch()}
            />
          </div>
        )}
        {products.data?.items.length === 0 && (
          <div className="rounded-xl border border-[#e0e0e2] bg-background p-6 dark:border-white/10">
            <EmptyState title="محصولی در این دسته نیست" />
          </div>
        )}
        {!!products.data?.items.length && (
          <div className="space-y-4">
            <ProductGrid>
              {products.data.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ProductGrid>
            <div className="flex justify-center pb-4">
              <Pagination
                page={products.data.page}
                totalPages={products.data.totalPages}
                onChange={setPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
