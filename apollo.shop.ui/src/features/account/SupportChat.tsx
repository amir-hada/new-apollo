"use client";

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";
import { Check, CheckCheck, Headphones, Send } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import {
  createChatHubConnection,
  startChatHub,
  subscribeChatHub,
  unsubscribeChatHub,
} from "@/lib/signalr/chat-hub";
import { cn, getDisplayNameInitials } from "@/lib/utils";
import type {
  ChatConversation,
  ChatMessage,
  ChatMessagesRead,
} from "@/features/admin/chats/data/chat-types";

function scrollChatToBottom(el: HTMLDivElement | null, smooth = true) {
  if (!el) return;
  el.scrollTo({
    top: el.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });
}

function MessageTicks({ isRead }: { isRead?: boolean }) {
  if (isRead) {
    return <CheckCheck className="size-3.5 shrink-0 text-sky-300" aria-label="خوانده شد" />;
  }
  return <Check className="size-3.5 shrink-0 opacity-80" aria-label="ارسال شد" />;
}

export function SupportChat() {
  const queryClient = useQueryClient();
  const myUserId = useAuthStore((s) => s.user?.id);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const shouldStickRef = useRef(true);

  const conversation = useQuery({
    queryKey: ["my-support-chat"],
    queryFn: async () =>
      (await api.post<ChatConversation>("/api/chats/conversations/support")).data,
  });

  const conversationId = conversation.data?.id;

  const messages = useQuery({
    queryKey: ["my-chat-messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () =>
      (
        await api.get<ChatMessage[]>(
          `/api/chats/conversations/${conversationId}/messages`,
          { params: { take: 200 } },
        )
      ).data,
  });

  useEffect(() => {
    if (!conversationId) return;
    void api.post(`/api/chats/conversations/${conversationId}/read`);
  }, [conversationId, messages.data?.length]);

  useLayoutEffect(() => {
    if (!shouldStickRef.current) return;
    scrollChatToBottom(listRef.current, false);
  }, [messages.data?.length, conversationId]);

  useEffect(() => {
    const connection = createChatHubConnection();
    let stopped = false;

    (async () => {
      try {
        await startChatHub(connection);
        if (stopped) return;
        subscribeChatHub(connection, {
          onMessage: (msg) => {
            if (conversationId && msg.conversationId !== conversationId) return;
            const mine = myUserId ? msg.senderUserId === myUserId : msg.isMine;
            const normalized = { ...msg, isMine: mine, isRead: mine ? Boolean(msg.isRead) : false };
            queryClient.setQueryData<ChatMessage[]>(
              ["my-chat-messages", msg.conversationId],
              (prev) => {
                if (!prev) return [normalized];
                if (prev.some((m) => m.id === normalized.id)) return prev;
                return [...prev, normalized];
              },
            );
            if (!mine) {
              void api.post(`/api/chats/conversations/${msg.conversationId}/read`);
            }
            shouldStickRef.current = true;
            requestAnimationFrame(() => scrollChatToBottom(listRef.current, true));
          },
          onConversationUpdated: () => {
            queryClient.invalidateQueries({ queryKey: ["my-support-chat"] });
          },
          onMessagesRead: (payload: ChatMessagesRead) => {
            if (conversationId && payload.conversationId !== conversationId) return;
            // Admin read our messages → double tick
            if (!payload.readerIsAdmin) return;
            const readAt = new Date(payload.readAtUtc).getTime();
            queryClient.setQueryData<ChatMessage[]>(
              ["my-chat-messages", payload.conversationId],
              (prev) =>
                prev?.map((m) =>
                  m.isMine && new Date(m.createdAtUtc).getTime() <= readAt
                    ? { ...m, isRead: true }
                    : m,
                ),
            );
          },
        });
      } catch {
        // REST fallback
      }
    })();

    return () => {
      stopped = true;
      unsubscribeChatHub(connection);
      void connection.stop();
    };
  }, [conversationId, myUserId, queryClient]);

  const send = useMutation({
    mutationFn: async (body: string) => {
      if (!conversationId) throw new Error("no conversation");
      return (
        await api.post<ChatMessage>(
          `/api/chats/conversations/${conversationId}/messages`,
          { body },
        )
      ).data;
    },
    onSuccess: (msg) => {
      setDraft("");
      shouldStickRef.current = true;
      queryClient.setQueryData<ChatMessage[]>(
        ["my-chat-messages", msg.conversationId],
        (prev) => {
          if (!prev) return [{ ...msg, isMine: true, isRead: false }];
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, { ...msg, isMine: true, isRead: false }];
        },
      );
      requestAnimationFrame(() => scrollChatToBottom(listRef.current, true));
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const grouped = useMemo(() => {
    const list = messages.data ?? [];
    return list.reduce((acc: Record<string, ChatMessage[]>, obj) => {
      const key = format(new Date(obj.createdAtUtc), "d MMM yyyy", { locale: faIR });
      if (!acc[key]) acc[key] = [];
      acc[key].push(obj);
      return acc;
    }, {});
  }, [messages.data]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || send.isPending) return;
    send.mutate(body);
  };

  const peerName = conversation.data?.peerFullName?.trim() || "پشتیبانی";
  const peerAvatar = conversation.data?.peerAvatarUrl ?? undefined;

  if (conversation.isLoading) {
    return (
      <div className="flex h-[min(70vh,720px)] items-center justify-center rounded-xl border border-border bg-background text-sm text-muted-foreground">
        در حال آماده‌سازی گفتگو...
      </div>
    );
  }

  if (conversation.isError) {
    return (
      <p className="text-sm text-destructive">{getApiErrorMessage(conversation.error)}</p>
    );
  }

  return (
    <div
      dir="rtl"
      className="flex h-[min(70vh,720px)] flex-col overflow-hidden rounded-xl border border-border bg-background"
    >
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Avatar className="size-10 ring-1 ring-border">
          <AvatarImage src={peerAvatar} alt={peerName} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getDisplayNameInitials(peerName) || <Headphones className="size-4" />}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{peerName}</p>
          <p className="text-xs text-muted-foreground">پشتیبانی آنلاین فروشگاه</p>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto overscroll-contain bg-muted/20 px-3 py-3 sm:px-4"
        onScroll={(e) => {
          const el = e.currentTarget;
          const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
          shouldStickRef.current = distance < 80;
        }}
      >
        {Object.keys(grouped).length === 0 && (
          <div className="m-auto max-w-xs space-y-2 py-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Headphones className="size-5" />
            </div>
            <p className="text-sm font-medium">گفتگو با پشتیبانی</p>
            <p className="text-xs leading-5 text-muted-foreground">
              اولین پیام را بفرستید؛ تیم پشتیبانی در اسرع وقت پاسخ می‌دهد.
            </p>
          </div>
        )}

        {Object.keys(grouped).map((key) => (
          <Fragment key={key}>
            <div className="sticky top-1 z-[1] mx-auto rounded-full bg-background/90 px-3 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
              {key}
            </div>
            {grouped[key].map((msg) => {
              const mine = msg.isMine;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex max-w-[85%] items-end gap-2 sm:max-w-[75%]",
                    // فیزیکی راست/چپ مثل واتساپ (مستقل از dir)
                    mine ? "ml-auto flex-row-reverse" : "mr-auto",
                  )}
                >
                  {!mine ? (
                    <Avatar className="mb-0.5 size-7 shrink-0">
                      <AvatarImage
                        src={msg.senderAvatarUrl ?? peerAvatar}
                        alt={msg.senderFullName || peerName}
                      />
                      <AvatarFallback className="text-[10px]">
                        {getDisplayNameInitials(msg.senderFullName || peerName)}
                      </AvatarFallback>
                    </Avatar>
                  ) : null}

                  <div
                    className={cn(
                      "px-3 py-2 text-sm leading-6 shadow-sm",
                      mine
                        ? "rounded-lg rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-lg rounded-bl-sm bg-card text-foreground ring-1 ring-border",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words text-right">{msg.body}</p>
                    <span
                      className={cn(
                        "mt-1 flex items-center justify-end gap-1 text-[10px] leading-none opacity-80",
                        mine ? "text-primary-foreground" : "text-muted-foreground",
                      )}
                    >
                      <span>
                        {format(new Date(msg.createdAtUtc), "HH:mm", { locale: faIR })}
                      </span>
                      {mine ? <MessageTicks isRead={msg.isRead} /> : null}
                    </span>
                  </div>
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="flex items-end gap-2 border-t border-border bg-card p-3"
      >
        <input
          className="h-11 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          placeholder="پیام خود را بنویسید..."
          value={draft}
          dir="rtl"
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => {
            shouldStickRef.current = true;
            requestAnimationFrame(() => scrollChatToBottom(listRef.current, true));
          }}
          disabled={send.isPending}
        />
        <Button
          type="submit"
          className="h-11 shrink-0 rounded-lg px-4"
          disabled={!draft.trim() || send.isPending}
        >
          <Send className="size-4 rotate-180" />
          ارسال
        </Button>
      </form>
    </div>
  );
}
