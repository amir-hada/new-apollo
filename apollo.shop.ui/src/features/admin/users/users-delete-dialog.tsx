"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "./types";

type UsersDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: User;
  onConfirm?: (user: User) => Promise<void> | void;
  submitting?: boolean;
};

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onConfirm,
  submitting = false,
}: UsersDeleteDialogProps) {
  const [value, setValue] = useState("");
  const actionLabel = currentRow.isActive ? "غیرفعال‌سازی" : "حذف";

  const handleConfirm = async () => {
    if (value.trim() !== currentRow.username) return;
    try {
      await onConfirm?.(currentRow);
      setValue("");
      onOpenChange(false);
    } catch {
      // caller handles errors
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) setValue("");
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="text-destructive">
            <AlertTriangle
              className="me-1 inline-block stroke-destructive"
              size={18}
            />{" "}
            {actionLabel} کاربر
          </DialogTitle>
          <DialogDescription>
            آیا از {actionLabel} کاربر{" "}
            <span className="font-bold text-foreground">
              {currentRow.username}
            </span>{" "}
            مطمئن هستید؟ نقش:{" "}
            <span className="font-bold uppercase text-foreground">
              {currentRow.role}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>نام کاربری برای تأیید:</Label>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="نام کاربری را وارد کنید"
              autoFocus
            />
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">هشدار!</p>
            <p className="mt-1">
              این عملیات قابل بازگشت نیست. لطفاً با دقت ادامه دهید.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button
            variant="destructive"
            disabled={value.trim() !== currentRow.username || submitting}
            onClick={handleConfirm}
          >
            {submitting ? "در حال انجام..." : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
