"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
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
import { api, getApiErrorMessage } from "@/lib/api";
import { orderStatusLabel } from "@/lib/labels";
import { formatDate, formatPrice } from "@/lib/utils";
import type { OrderListItem, OrderStatus, PagedResult } from "@/types/api";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const queryClient = useQueryClient();

  const orders = useQuery({
    queryKey: ["admin-orders", page, q, status],
    queryFn: async () =>
      (
        await api.get<PagedResult<OrderListItem>>("/api/admin/orders", {
          params: {
            page,
            pageSize: 10,
            search: q || undefined,
            status: status === "" ? undefined : Number(status),
          },
        })
      ).data,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: OrderStatus }) =>
      api.put(`/api/admin/orders/${id}/status`, { status: next }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("وضعیت به‌روز شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <AdminPageHeader
        actions={
          <>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو..."
              className="w-48"
            />
            <select
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(orderStatusLabel).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                setPage(1);
                setQ(search.trim());
              }}
            >
              فیلتر
            </Button>
          </>
        }
      />

      {orders.isLoading && <Skeleton className="h-64 w-full" />}
      {orders.isError && <ErrorState message={getApiErrorMessage(orders.error)} onRetry={() => orders.refetch()} />}
      {orders.data?.items.length === 0 && <EmptyState title="سفارشی یافت نشد" />}
      {!!orders.data?.items.length && (
        <>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شماره</TableHead>
                  <TableHead>مشتری</TableHead>
                  <TableHead>مبلغ</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>تغییر وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.data.items.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link href={`/account/orders/${o.id}`} className="text-primary hover:underline">
                        {o.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{o.customerEmail || "—"}</TableCell>
                    <TableCell>{formatPrice(o.grandTotal)}</TableCell>
                    <TableCell>{orderStatusLabel[o.status]}</TableCell>
                    <TableCell>{formatDate(o.createdAtUtc)}</TableCell>
                    <TableCell>
                      <select
                        className="h-9 rounded-lg border border-border bg-background px-2 text-xs"
                        value={o.status}
                        onChange={(e) =>
                          updateStatus.mutate({ id: o.id, next: Number(e.target.value) as OrderStatus })
                        }
                      >
                        {Object.entries(orderStatusLabel).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={orders.data.page} totalPages={orders.data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
