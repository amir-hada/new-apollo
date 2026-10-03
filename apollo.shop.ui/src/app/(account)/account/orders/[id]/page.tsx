"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/shared/States";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { orderStatusLabel } from "@/lib/labels";
import { formatDate, formatPrice } from "@/lib/utils";
import type { OrderDetail } from "@/types/api";

export default function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = useQuery({
    queryKey: ["my-order", id],
    queryFn: async () => (await api.get<OrderDetail>(`/api/orders/${id}`)).data,
  });

  if (order.isLoading) return <Skeleton className="h-80 w-full" />;
  if (order.isError) return <ErrorState message={getApiErrorMessage(order.error)} onRetry={() => order.refetch()} />;
  const o = order.data!;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">سفارش {o.orderNumber}</h1>
        <Badge>{orderStatusLabel[o.status]}</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4 text-sm space-y-2">
          <p>
            <span className="text-muted-foreground">تاریخ:</span> {formatDate(o.createdAtUtc)}
          </p>
          <p>
            <span className="text-muted-foreground">پرداخت:</span> {formatDate(o.paidAtUtc)}
          </p>
          <p>
            <span className="text-muted-foreground">آدرس:</span> {o.shippingAddressSnapshot}
          </p>
          {o.notes && (
            <p>
              <span className="text-muted-foreground">یادداشت:</span> {o.notes}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border p-4 text-sm space-y-2">
          <p>جمع جزء: {formatPrice(o.subtotal)}</p>
          <p>تخفیف: {formatPrice(o.discountAmount)}</p>
          <p>ارسال: {formatPrice(o.shippingAmount)}</p>
          <p>مالیات: {formatPrice(o.taxAmount)}</p>
          <p className="text-base font-bold">مبلغ نهایی: {formatPrice(o.grandTotal)}</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start font-medium">محصول</th>
              <th className="px-4 py-3 text-start font-medium">SKU</th>
              <th className="px-4 py-3 text-start font-medium">تعداد</th>
              <th className="px-4 py-3 text-start font-medium">مبلغ</th>
            </tr>
          </thead>
          <tbody>
            {o.items.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div>{item.productName}</div>
                  {(item.selectedOptions?.length ?? 0) > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.selectedOptions!
                        .map((opt) => `${opt.name}: ${opt.value}`)
                        .join(" · ")}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{item.sku}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{formatPrice(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
