"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, Pagination } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { orderStatusLabel } from "@/lib/labels";
import { formatDate, formatPrice } from "@/lib/utils";
import type { OrderListItem, PagedResult } from "@/types/api";

export default function AccountOrdersPage() {
  const [page, setPage] = useState(1);
  const orders = useQuery({
    queryKey: ["my-orders", page],
    queryFn: async () =>
      (await api.get<PagedResult<OrderListItem>>("/api/orders", { params: { page, pageSize: 10 } }))
        .data,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3.5">
        <h1 className="text-[15px] font-bold">سفارش‌های من</h1>
      </div>

      <div className="p-4">
        {orders.isLoading && <Skeleton className="h-64 w-full rounded-xl" />}
        {orders.isError && (
          <ErrorState message={getApiErrorMessage(orders.error)} onRetry={() => orders.refetch()} />
        )}
        {orders.data?.items.length === 0 && <EmptyState title="هنوز سفارشی ندارید" />}
        {!!orders.data?.items.length && (
          <>
            {/* موبایل: کارت */}
            <div className="space-y-3 md:hidden">
              {orders.data.items.map((o) => (
                <Link
                  key={o.id}
                  href={`/account/orders/${o.id}`}
                  className="block rounded-xl border border-border p-3.5 transition hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-primary">
                        {o.orderNumber}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(o.createdAtUtc)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
                      {orderStatusLabel[o.status]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold tabular-nums">
                    {formatPrice(o.grandTotal)}
                  </p>
                </Link>
              ))}
            </div>

            {/* دسکتاپ/تبلت: جدول */}
            <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">شماره</th>
                    <th className="px-4 py-3 text-start font-medium">وضعیت</th>
                    <th className="px-4 py-3 text-start font-medium">مبلغ</th>
                    <th className="px-4 py-3 text-start font-medium">تاریخ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.data.items.map((o) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <Link
                          href={`/account/orders/${o.id}`}
                          className="text-primary hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{orderStatusLabel[o.status]}</td>
                      <td className="px-4 py-3">{formatPrice(o.grandTotal)}</td>
                      <td className="px-4 py-3">{formatDate(o.createdAtUtc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Pagination
                page={orders.data.page}
                totalPages={orders.data.totalPages}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
