"use client";

import { type FormEvent, useEffect, useState } from "react";
import { MailPlus, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roles } from "./data";

type UsersInviteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UsersInviteDialog({
  open,
  onOpenChange,
}: UsersInviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("");
      setDesc("");
    }
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("ایمیل الزامی است");
      return;
    }
    if (!role) {
      toast.error("نقش الزامی است");
      return;
    }
    toast.success(`دعوت‌نامه برای ${email} ارسال خواهد شد (به‌زودی)`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <MailPlus /> دعوت کاربر
          </DialogTitle>
          <DialogDescription>
            کاربر جدید را با ارسال ایمیل دعوت کنید و نقش دسترسی او را مشخص کنید.
          </DialogDescription>
        </DialogHeader>
        <form
          id="user-invite-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>ایمیل</Label>
            <Input
              type="email"
              placeholder="مثال: john.doe@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>نقش</Label>
            <Select
              value={role || undefined}
              onValueChange={(v) => v && setRole(String(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="انتخاب نقش" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>توضیحات (اختیاری)</Label>
            <Textarea
              className="resize-none"
              placeholder="پیام شخصی برای دعوت (اختیاری)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </form>
        <DialogFooter className="gap-y-2">
          <DialogClose render={<Button variant="outline" />}>انصراف</DialogClose>
          <Button type="submit" form="user-invite-form">
            دعوت <Send />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
