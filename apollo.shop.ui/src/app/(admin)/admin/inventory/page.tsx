"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { EmptyState, ErrorState, Pagination } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import type { PagedResult, ProductListItem } from "@/types/api";

export default function AdminInventoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const products = useQuery({
    queryKey: ["admin-inventory", page, q],
    queryFn: async () =>
      (
        await api.get<PagedResult<ProductListItem>>("/api/admin/products", {
          params: { page, pageSize: 15, search: q || undefined },
        })
      ).data,
  });

  const summary = useMemo(() => {
    const items = products.data?.items ?? [];
    const totalQty = items.reduce((sum, p) => sum + (p.stockQuantity ?? 0), 0);
    const unavailable = items.filter((p) => !p.isAvailable).length;
    const low = items.filter(
      (p) => p.isAvailable && (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= 5,
    ).length;
    return { totalQty, unavailable, low };
  }, [products.data?.items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute start-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder="جستجوی محصول..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                setQ(search.trim());
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPage(1);
            setQ(search.trim());
          }}
        >
          جستجو
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-border/80 p-3">
          <p className="text-xs text-muted-foreground">موجودی در این صفحه</p>
          <p className="mt-1 text-lg font-semibold">
            {toPersianDigits(String(summary.totalQty))}
          </p>
        </div>
        <div className="rounded-xl border border-border/80 p-3">
          <p className="text-xs text-muted-foreground">موجودی کم (≤۵)</p>
          <p className="mt-1 text-lg font-semibold text-amber-700 dark:text-amber-400">
            {toPersianDigits(String(summary.low))}
          </p>
        </div>
        <div className="rounded-xl border border-border/80 p-3">
          <p className="text-xs text-muted-foreground">ناموجود</p>
          <p className="mt-1 text-lg font-semibold text-destructive">
            {toPersianDigits(String(summary.unavailable))}
          </p>
        </div>
      </div>

      {products.isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : products.isError ? (
        <ErrorState
          message={getApiErrorMessage(products.error)}
          onRetry={() => products.refetch()}
        />
      ) : (products.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="محصولی یافت نشد"
          description="برای مدیریت موجودی، ابتدا محصولی ثبت کنید."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>محصول</TableHead>
                <TableHead>کد کالا</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>موجودی</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.data!.items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{toPersianDigits(p.productCode)}</TableCell>
                  <TableCell dir="ltr">{p.sku || "—"}</TableCell>
                  <TableCell>
                    <span
                      className={
                        p.stockQuantity <= 0
                          ? "text-destructive"
                          : p.stockQuantity <= 5
                            ? "text-amber-700 dark:text-amber-400"
                            : undefined
                      }
                    >
                      {toPersianDigits(String(p.stockQuantity))}
                    </span>
                  </TableCell>
                  <TableCell>
                    {p.isAvailable ? "موجود" : "ناموجود"}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button render={<Link href={`/admin/products/${p.id}`} />} variant="ghost" size="sm">
                      مدیریت
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {products.data && products.data.totalPages > 1 ? (
        <Pagination
          page={page}
          totalPages={products.data.totalPages}
          onChange={setPage}
        />
      ) : null}
    </div>
  );
}
