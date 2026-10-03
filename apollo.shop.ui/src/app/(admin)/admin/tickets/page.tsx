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
import { ticketPriorityLabel, ticketStatusLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import type { PagedResult, TicketListItem, TicketStatus } from "@/types/api";

export default function AdminTicketsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();

  const tickets = useQuery({
    queryKey: ["admin-tickets", page, q, status],
    queryFn: async () =>
      (
        await api.get<PagedResult<TicketListItem>>("/api/admin/tickets", {
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
    mutationFn: async ({ id, next }: { id: string; next: TicketStatus }) =>
      api.put(`/api/admin/tickets/${id}/status`, { status: next }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      toast.success("وضعیت تیکت به‌روز شد");
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
              <option value="">همه</option>
              {Object.entries(ticketStatusLabel).map(([k, v]) => (
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

      {tickets.isLoading && <Skeleton className="h-64 w-full" />}
      {tickets.isError && (
        <ErrorState message={getApiErrorMessage(tickets.error)} onRetry={() => tickets.refetch()} />
      )}
      {tickets.data?.items.length === 0 && <EmptyState title="تیکتی یافت نشد" />}
      {!!tickets.data?.items.length && (
        <>
          <div className="overflow-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شماره</TableHead>
                  <TableHead>موضوع</TableHead>
                  <TableHead>اولویت</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>تغییر</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.data.items.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link href={`/account/tickets/${t.id}`} className="text-primary hover:underline">
                        {t.number}
                      </Link>
                    </TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell>{ticketPriorityLabel[t.priority]}</TableCell>
                    <TableCell>{ticketStatusLabel[t.status]}</TableCell>
                    <TableCell>{formatDate(t.createdAtUtc)}</TableCell>
                    <TableCell>
                      <select
                        className="h-9 rounded-lg border border-border bg-background px-2 text-xs"
                        value={t.status}
                        onChange={(e) =>
                          updateStatus.mutate({ id: t.id, next: Number(e.target.value) as TicketStatus })
                        }
                      >
                        {Object.entries(ticketStatusLabel).map(([k, v]) => (
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
          <Pagination page={tickets.data.page} totalPages={tickets.data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
