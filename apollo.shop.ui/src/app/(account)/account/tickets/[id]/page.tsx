"use client";

import { FormEvent, useState, use } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { ticketPriorityLabel, ticketStatusLabel } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import type { TicketDetail } from "@/types/api";

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const ticket = useQuery({
    queryKey: ["my-ticket", id],
    queryFn: async () => (await api.get<TicketDetail>(`/api/tickets/${id}`)).data,
  });

  const reply = useMutation({
    mutationFn: async () => (await api.post<TicketDetail>(`/api/tickets/${id}/replies`, { message })).data,
    onSuccess: (data) => {
      queryClient.setQueryData(["my-ticket", id], data);
      setMessage("");
      toast.success("پاسخ ارسال شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (ticket.isLoading) return <Skeleton className="h-80 w-full" />;
  if (ticket.isError) return <ErrorState message={getApiErrorMessage(ticket.error)} onRetry={() => ticket.refetch()} />;
  const t = ticket.data!;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{t.subject}</h1>
          <Badge>{ticketStatusLabel[t.status]}</Badge>
          <Badge variant="secondary">{ticketPriorityLabel[t.priority]}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.number} · {formatDate(t.createdAtUtc)}
        </p>
      </div>
      <div className="space-y-3">
        {t.messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl border border-border p-4 text-sm ${m.isStaff ? "bg-secondary/40" : ""}`}
          >
            <p className="mb-2 text-xs text-muted-foreground">
              {m.isStaff ? "پشتیبانی" : "شما"} · {formatDate(m.createdAtUtc)}
            </p>
            <p className="whitespace-pre-wrap leading-7">{m.body}</p>
          </div>
        ))}
      </div>
      <form
        className="space-y-3 rounded-xl border border-border p-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          reply.mutate();
        }}
      >
        <Textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="پاسخ شما..." />
        <Button disabled={reply.isPending}>{reply.isPending ? "ارسال..." : "ارسال پاسخ"}</Button>
      </form>
    </div>
  );
}
