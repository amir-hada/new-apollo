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
      (await api.get<PagedResult<OrderListItem>>("/api/orders", { params: { page, pageSize: 10 } })).data,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">سفارش‌های من</h1>
      {orders.isLoading && <Skeleton className="h-64 w-full" />}
      {orders.isError && <ErrorState message={getApiErrorMessage(orders.error)} onRetry={() => orders.refetch()} />}
      {orders.data?.items.length === 0 && <EmptyState title="هنوز سفارشی ندارید" />}
      {!!orders.data?.items.length && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
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
                      <Link href={`/account/orders/${o.id}`} className="text-primary hover:underline">
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
          <Pagination page={orders.data.page} totalPages={orders.data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
