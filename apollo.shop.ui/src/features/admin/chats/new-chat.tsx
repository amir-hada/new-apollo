"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";
import { type ChatUser } from "./data/chat-types";

type User = Omit<ChatUser, "messages">;

type NewChatProps = {
  users: User[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewChat({ users, onOpenChange, open }: NewChatProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q),
    );
  }, [query, users]);

  const handleSelectUser = (user: User) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    } else {
      handleRemoveUser(user.id);
    }
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setSelectedUsers([]);
      setQuery("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>پیام جدید</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline-last gap-2">
            <span className="min-h-6 text-sm text-muted-foreground">به:</span>
            {selectedUsers.map((user) => (
              <Badge key={user.id} variant="default">
                {user.fullName}
                <button
                  type="button"
                  className="ms-1 rounded-full outline-hidden ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemoveUser(user.id);
                    }
                  }}
                  onClick={() => handleRemoveUser(user.id)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="overflow-hidden rounded-lg border">
            <Input
              placeholder="جستجوی افراد..."
              className="rounded-none border-0 border-b shadow-none focus-visible:ring-0"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <ScrollArea className="h-56">
              <div className="p-1">
                {filteredUsers.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                    فردی یافت نشد.
                  </p>
                ) : (
                  filteredUsers.map((user) => {
                    const selected = !!selectedUsers.find((u) => u.id === user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-start hover:bg-accent hover:text-accent-foreground",
                          selected && "bg-accent/60",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={user.profile || "/placeholder.svg"}
                            alt={user.fullName}
                            className="h-8 w-8 rounded-full"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {user.fullName}
                            </span>
                            <span className="text-xs text-accent-foreground/70">
                              {user.username}
                            </span>
                          </div>
                        </div>
                        {selected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
          <Button
            variant="default"
            onClick={() => {
              toast.success(
                `گفتگو با ${selectedUsers.map((u) => u.fullName).join("، ")} شروع شد`,
              );
              handleOpenChange(false);
            }}
            disabled={selectedUsers.length === 0}
          >
            گفتگو
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
