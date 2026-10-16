"use client";

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Edit,
  MessagesSquare,
  Search as SearchIcon,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  ChatUserSearch,
} from "./data/chat-types";
import { NewChat } from "./new-chat";

function scrollChatToBottom(el: HTMLDivElement | null, smooth = true) {
  if (!el) return;
  el.scrollTo({
    top: el.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });
}

export function AdminChats() {
  const queryClient = useQueryClient();
  const myUserId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const shouldStickRef = useRef(true);
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

  const conversations = useQuery({
    queryKey: ["admin-chats", search],
    queryFn: async () =>
      (
        await api.get<ChatConversation[]>("/api/admin/chats/conversations", {
          params: { search: search.trim() || undefined },
        })
      ).data,
    refetchInterval: 60_000,
  });

  const selected = useMemo(
    () => conversations.data?.find((c) => c.id === selectedId) ?? null,
    [conversations.data, selectedId],
  );

  const messages = useQuery({
    queryKey: ["admin-chat-messages", selectedId],
    enabled: !!selectedId,
    queryFn: async () =>
      (
        await api.get<ChatMessage[]>(
          `/api/admin/chats/conversations/${selectedId}/messages`,
          { params: { take: 200 } },
        )
      ).data,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) =>
      api.post(`/api/admin/chats/conversations/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-chat-unread"] });
    },
  });

  useEffect(() => {
    if (!selectedId) return;
    markRead.mutate(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, messages.data?.length]);

  useLayoutEffect(() => {
    if (!shouldStickRef.current) return;
    scrollChatToBottom(listRef.current, false);
  }, [messages.data?.length, selectedId]);

  useEffect(() => {
    const connection = createChatHubConnection();
    let stopped = false;

    (async () => {
      try {
        await startChatHub(connection);
        if (stopped) return;
        subscribeChatHub(connection, {
          onMessage: (msg) => {
            const mine = myUserId ? msg.senderUserId === myUserId : msg.isMine;
            const normalized = {
              ...msg,
              isMine: mine,
              isRead: mine ? Boolean(msg.isRead) : false,
            };
            queryClient.setQueryData<ChatMessage[]>(
              ["admin-chat-messages", msg.conversationId],
              (prev) => {
                if (!prev) return [normalized];
                if (prev.some((m) => m.id === normalized.id)) return prev;
                return [...prev, normalized];
              },
            );
            queryClient.invalidateQueries({ queryKey: ["admin-chats"] });
            queryClient.invalidateQueries({ queryKey: ["admin-chat-unread"] });
            if (selectedIdRef.current === msg.conversationId) {
              if (!mine) {
                void api.post(`/api/admin/chats/conversations/${msg.conversationId}/read`);
              }
              shouldStickRef.current = true;
              requestAnimationFrame(() => scrollChatToBottom(listRef.current, true));
            }
          },
          onConversationUpdated: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-chats"] });
            queryClient.invalidateQueries({ queryKey: ["admin-chat-unread"] });
          },
          onMessagesRead: (payload: ChatMessagesRead) => {
            if (payload.readerIsAdmin) return;
            const readAt = new Date(payload.readAtUtc).getTime();
            queryClient.setQueryData<ChatMessage[]>(
              ["admin-chat-messages", payload.conversationId],
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
        // Hub optional while REST still works
      }
    })();

    return () => {
      stopped = true;
      unsubscribeChatHub(connection);
      void connection.stop();
    };
  }, [myUserId, queryClient]);

  const send = useMutation({
    mutationFn: async (body: string) => {
      if (!selectedId) throw new Error("no conversation");
      return (
        await api.post<ChatMessage>(
          `/api/admin/chats/conversations/${selectedId}/messages`,
          { body },
        )
      ).data;
    },
    onSuccess: (msg) => {
      setDraft("");
      shouldStickRef.current = true;
      queryClient.setQueryData<ChatMessage[]>(
        ["admin-chat-messages", msg.conversationId],
        (prev) => {
          const next = { ...msg, isMine: true, isRead: false };
          if (!prev) return [next];
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, next];
        },
      );
      queryClient.invalidateQueries({ queryKey: ["admin-chats"] });
      requestAnimationFrame(() => scrollChatToBottom(listRef.current, true));
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const startChat = useMutation({
    mutationFn: async (payload: { user: ChatUserSearch; initialMessage?: string }) =>
      (
        await api.post<ChatConversation>("/api/admin/chats/conversations", {
          customerUserId: payload.user.id,
          initialMessage: payload.initialMessage ?? null,
        })
      ).data,
    onSuccess: (convo) => {
      queryClient.invalidateQueries({ queryKey: ["admin-chats"] });
      setSelectedId(convo.id);
      setMobileOpen(true);
      toast.success("گفتگو آماده است");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const grouped = useMemo(() => {
    const list = messages.data ?? [];
    return list.reduce((acc: Record<string, ChatMessage[]>, obj) => {
      const key = format(new Date(obj.createdAtUtc), "d MMM, yyyy", { locale: faIR });
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

  return (
    <section className="relative flex min-h-0 flex-1 gap-0 overflow-hidden sm:gap-6">
      <div
        className={cn(
          "flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80",
          mobileOpen && "hidden sm:flex",
        )}
      >
        <div className="sticky top-0 z-10 -mx-4 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessagesSquare size={20} />
              <span className="text-sm font-medium">گفتگوها</span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCreateOpen(true)}
              className="rounded-lg"
            >
              <Edit size={24} className="stroke-muted-foreground" />
            </Button>
          </div>

          <label
            className={cn(
              "focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden",
              "flex h-10 w-full items-center space-x-0 rounded-md border border-border ps-2",
            )}
          >
            <SearchIcon size={15} className="me-2 stroke-slate-500" />
            <span className="sr-only">جستجو</span>
            <input
              type="text"
              className="w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden"
              placeholder="جستجوی گفتگو..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        <ScrollArea className="-mx-3 h-full overflow-scroll p-3">
          {conversations.isLoading && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              در حال بارگذاری...
            </p>
          )}
          {conversations.isError && (
            <p className="px-2 py-6 text-center text-sm text-destructive">
              {getApiErrorMessage(conversations.error)}
            </p>
          )}
          {conversations.data?.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              هنوز گفتگویی نیست.
            </p>
          )}
          {conversations.data?.map((chat) => (
            <Fragment key={chat.id}>
              <button
                type="button"
                className={cn(
                  "group hover:bg-accent hover:text-accent-foreground",
                  "flex w-full rounded-md px-2 py-2 text-start text-sm",
                  selectedId === chat.id && "sm:bg-muted",
                )}
                onClick={() => {
                  setSelectedId(chat.id);
                  setMobileOpen(true);
                }}
              >
                <div className="flex w-full gap-2">
                  <Avatar>
                    <AvatarImage
                      src={chat.customerAvatarUrl ?? undefined}
                      alt={chat.customerFullName}
                    />
                    <AvatarFallback>
                      {getDisplayNameInitials(chat.customerFullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{chat.customerFullName}</span>
                      {chat.unreadCount > 0 && (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="line-clamp-2 text-ellipsis text-muted-foreground group-hover:text-accent-foreground/90">
                      {chat.lastMessagePreview || "بدون پیام"}
                    </span>
                  </div>
                </div>
              </button>
              <Separator className="my-1" />
            </Fragment>
          ))}
        </ScrollArea>
      </div>

      {selected ? (
        <div
          className={cn(
            "absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col border bg-background shadow-xs sm:static sm:z-auto sm:flex sm:rounded-md",
            mobileOpen && "inset-s-0 flex",
          )}
        >
          <div className="mb-1 flex flex-none justify-between bg-card p-4 shadow-lg sm:rounded-t-md">
            <div className="flex gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="-ms-2 h-full sm:hidden"
                onClick={() => setMobileOpen(false)}
              >
                <ArrowLeft className="rtl:rotate-180" />
              </Button>
              <div className="flex items-center gap-2 lg:gap-4">
                <Avatar className="size-9 lg:size-11">
                  <AvatarImage
                    src={selected.customerAvatarUrl ?? undefined}
                    alt={selected.customerFullName}
                  />
                  <AvatarFallback>
                    {getDisplayNameInitials(selected.customerFullName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-sm font-medium lg:text-base">
                    {selected.customerFullName}
                  </span>
                  <span className="block max-w-48 truncate text-xs text-muted-foreground lg:text-sm">
                    {selected.customerPhone || selected.customerEmail || "مشتری"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4" dir="rtl">
            <div className="flex size-full flex-1">
              <div className="chat-text-container relative -me-4 flex flex-1 flex-col overflow-y-hidden">
                <div
                  ref={listRef}
                  className="chat-flex flex min-h-0 w-full flex-1 flex-col justify-end gap-3 overflow-y-auto overscroll-contain py-2 pe-4 pb-4"
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
                    shouldStickRef.current = distance < 80;
                  }}
                >
                  {Object.keys(grouped).map((key) => (
                    <Fragment key={key}>
                      <div className="text-center text-xs text-muted-foreground">{key}</div>
                      {grouped[key].map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "chat-box max-w-72 px-3 py-2 wrap-break-word shadow-sm",
                            msg.isMine
                              ? "ml-auto rounded-lg rounded-br-sm bg-primary/90 text-primary-foreground"
                              : "mr-auto rounded-lg rounded-bl-sm bg-muted",
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words text-right text-sm leading-6">
                            {msg.body}
                          </p>
                          <span
                            className={cn(
                              "mt-1 flex items-center justify-end gap-1 text-[10px] leading-none opacity-80",
                              msg.isMine
                                ? "text-primary-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            <span>
                              {format(new Date(msg.createdAtUtc), "HH:mm", { locale: faIR })}
                            </span>
                            {msg.isMine ? (
                              msg.isRead ? (
                                <CheckCheck className="size-3.5 text-sky-300" />
                              ) : (
                                <Check className="size-3.5 opacity-80" />
                              )
                            ) : null}
                          </span>
                        </div>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            <form className="flex w-full flex-none gap-2" onSubmit={submit}>
              <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-card px-2 py-1 focus-within:ring-1 focus-within:ring-ring focus-within:outline-hidden lg:gap-4">
                <label className="flex-1">
                  <span className="sr-only">جعبه متن گفتگو</span>
                  <input
                    type="text"
                    placeholder="پیام خود را بنویسید..."
                    className="h-8 w-full bg-inherit focus-visible:outline-hidden"
                    dir="rtl"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onFocus={() => {
                      shouldStickRef.current = true;
                      requestAnimationFrame(() => scrollChatToBottom(listRef.current, true));
                    }}
                    disabled={send.isPending}
                  />
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  type="submit"
                  disabled={!draft.trim() || send.isPending}
                  className="hidden sm:inline-flex"
                >
                  <Send size={20} />
                </Button>
              </div>
              <Button
                className="h-full sm:hidden"
                type="submit"
                disabled={!draft.trim() || send.isPending}
              >
                <Send size={18} /> ارسال
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "absolute inset-0 start-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border bg-card shadow-xs sm:static sm:z-auto sm:flex",
          )}
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-border">
              <MessagesSquare className="size-8" />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-xl font-semibold">پیام‌های شما</h1>
              <p className="text-sm text-muted-foreground">
                کاربر را جستجو کنید و گفتگو را شروع کنید.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>ارسال پیام</Button>
          </div>
        </div>
      )}

      <NewChat
        open={createOpen}
        onOpenChange={setCreateOpen}
        starting={startChat.isPending}
        onStart={async (user, initialMessage) => {
          await startChat.mutateAsync({ user, initialMessage });
        }}
      />
    </section>
  );
}
