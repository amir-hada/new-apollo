"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmptyState, ErrorState, Pagination } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { ticketPriorityLabel, ticketStatusLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import type { PagedResult, TicketListItem } from "@/types/api";

export default function AccountTicketsPage() {
  const [page, setPage] = useState(1);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState(1);
  const queryClient = useQueryClient();

  const tickets = useQuery({
    queryKey: ["my-tickets", page],
    queryFn: async () =>
      (await api.get<PagedResult<TicketListItem>>("/api/tickets", { params: { page, pageSize: 10 } })).data,
  });

  const create = useMutation({
    mutationFn: async () =>
      (await api.post("/api/tickets", { subject, message, priority, categoryId: null })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      setSubject("");
      setMessage("");
      toast.success("تیکت ایجاد شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تیکت‌های پشتیبانی</h1>
      {tickets.isLoading && <Skeleton className="h-48 w-full" />}
      {tickets.isError && <ErrorState message={getApiErrorMessage(tickets.error)} onRetry={() => tickets.refetch()} />}
      {tickets.data?.items.length === 0 && <EmptyState title="تیکتی ندارید" />}
      {!!tickets.data?.items.length && (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">شماره</th>
                  <th className="px-4 py-3 text-start font-medium">موضوع</th>
                  <th className="px-4 py-3 text-start font-medium">وضعیت</th>
                  <th className="px-4 py-3 text-start font-medium">اولویت</th>
                  <th className="px-4 py-3 text-start font-medium">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {tickets.data.items.map((t) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link href={`/account/tickets/${t.id}`} className="text-primary hover:underline">
                        {t.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{t.subject}</td>
                    <td className="px-4 py-3">{ticketStatusLabel[t.status]}</td>
                    <td className="px-4 py-3">{ticketPriorityLabel[t.priority]}</td>
                    <td className="px-4 py-3">{formatDate(t.createdAtUtc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={tickets.data.page} totalPages={tickets.data.totalPages} onChange={setPage} />
        </>
      )}

      <form
        className="space-y-3 rounded-xl border border-border p-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <h2 className="font-semibold">ایجاد تیکت جدید</h2>
        <div>
          <Label htmlFor="subject">موضوع</Label>
          <Input id="subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="priority">اولویت</Label>
          <select
            id="priority"
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          >
            <option value={0}>کم</option>
            <option value={1}>متوسط</option>
            <option value={2}>بالا</option>
            <option value={3}>فوری</option>
          </select>
        </div>
        <div>
          <Label htmlFor="message">پیام</Label>
          <Textarea id="message" required value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <Button disabled={create.isPending}>{create.isPending ? "ارسال..." : "ارسال تیکت"}</Button>
      </form>
    </div>
  );
}
