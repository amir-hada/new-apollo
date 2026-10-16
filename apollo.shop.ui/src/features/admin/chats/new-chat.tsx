"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ChatUserSearch } from "./data/chat-types";

type NewChatProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (user: ChatUserSearch, initialMessage?: string) => Promise<void> | void;
  starting?: boolean;
};

export function NewChat({ open, onOpenChange, onStart, starting }: NewChatProps) {
  const [selected, setSelected] = useState<ChatUserSearch | null>(null);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const users = useQuery({
    queryKey: ["chat-user-search", debounced],
    enabled: open,
    queryFn: async () =>
      (
        await api.get<ChatUserSearch[]>("/api/admin/chats/users", {
          params: { search: debounced || undefined, limit: 30 },
        })
      ).data,
  });

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setSelected(null);
      setQuery("");
      setDebounced("");
      setInitialMessage("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>پیام جدید</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="min-h-6 text-sm text-muted-foreground">به:</span>
            {selected && (
              <Badge variant="default">
                {selected.fullName}
                <button
                  type="button"
                  className="ms-1 rounded-full outline-hidden"
                  onClick={() => setSelected(null)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Input
              placeholder="جستجوی نام، ایمیل یا موبایل..."
              className="rounded-none border-0 border-b shadow-none focus-visible:ring-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <ScrollArea className="h-56">
              <div className="p-1">
                {users.isLoading && (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    در حال جستجو...
                  </p>
                )}
                {users.isError && (
                  <p className="px-3 py-6 text-center text-sm text-destructive">
                    {getApiErrorMessage(users.error)}
                  </p>
                )}
                {users.data?.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    فردی یافت نشد.
                  </p>
                )}
                {users.data?.map((user) => {
                  const isSelected = selected?.id === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelected(isSelected ? null : user)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-start hover:bg-accent",
                        isSelected && "bg-accent/60",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user.avatarUrl || "/placeholder.svg"}
                          alt={user.fullName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.fullName}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.phoneNumber || user.email || "—"}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <Input
            placeholder="پیام اولیه (اختیاری)"
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
          />

          <Button
            disabled={!selected || starting}
            onClick={async () => {
              if (!selected) return;
              await onStart(selected, initialMessage.trim() || undefined);
              handleOpenChange(false);
            }}
          >
            {starting ? "در حال شروع..." : "شروع گفتگو"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
