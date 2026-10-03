"use client";

import { type FormEvent, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { roles } from "./data";
import type { User } from "./types";

export type CreateUserPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  isActive: boolean;
  roles: string[];
};

type UsersActionDialogProps = {
  currentRow?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (payload: CreateUserPayload) => Promise<void> | void;
  submitting?: boolean;
};

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  role: "customer",
};

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
}: UsersActionDialogProps) {
  const isEdit = !!currentRow;
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (currentRow) {
      setForm({
        firstName: currentRow.firstName,
        lastName: currentRow.lastName,
        email: currentRow.email,
        phoneNumber: currentRow.phoneNumber || "",
        password: "",
        confirmPassword: "",
        role: currentRow.role,
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [open, currentRow]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("نام و نام خانوادگی الزامی است.");
      return;
    }
    if (!form.email.trim()) {
      setError("ایمیل الزامی است.");
      return;
    }
    if (!isEdit) {
      if (!form.password) {
        setError("رمز عبور الزامی است.");
        return;
      }
      if (form.password.length < 8) {
        setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("رمز عبور و تکرار آن یکسان نیستند.");
        return;
      }
    }

    const roleLabel =
      form.role === "admin"
        ? "Admin"
        : form.role.charAt(0).toUpperCase() + form.role.slice(1);

    try {
      await onSubmit?.({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim() || null,
        isActive: true,
        roles: [roleLabel],
      });
      onOpenChange(false);
    } catch {
      // caller handles toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>
            {isEdit ? "ویرایش کاربر" : "افزودن کاربر جدید"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "اطلاعات کاربر را به‌روزرسانی کنید."
              : "کاربر جدید را از اینجا ایجاد کنید."}{" "}
            پس از اتمام ذخیره کنید.
          </DialogDescription>
        </DialogHeader>
        <form
          id="user-form"
          onSubmit={handleSubmit}
          className="max-h-[420px] space-y-4 overflow-y-auto px-0.5 py-1 pe-3"
        >
          <div className="grid grid-cols-6 items-center gap-x-4 gap-y-1">
            <Label className="col-span-2 text-end">نام</Label>
            <Input
              className="col-span-4"
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
              autoComplete="off"
              required
            />
          </div>
          <div className="grid grid-cols-6 items-center gap-x-4 gap-y-1">
            <Label className="col-span-2 text-end">نام خانوادگی</Label>
            <Input
              className="col-span-4"
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
              autoComplete="off"
              required
            />
          </div>
          <div className="grid grid-cols-6 items-center gap-x-4 gap-y-1">
            <Label className="col-span-2 text-end">ایمیل</Label>
            <Input
              className="col-span-4"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              required
              disabled={isEdit}
            />
          </div>
          <div className="grid grid-cols-6 items-center gap-x-4 gap-y-1">
            <Label className="col-span-2 text-end">موبایل</Label>
            <Input
              className="col-span-4"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, phoneNumber: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-6 items-center gap-x-4 gap-y-1">
            <Label className="col-span-2 text-end">نقش</Label>
            <Select
              value={form.role}
              onValueChange={(v) =>
                v && setForm((f) => ({ ...f, role: String(v) }))
              }
            >
              <SelectTrigger className="col-span-4 w-full">
                <SelectValue placeholder="انتخاب نقش" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isEdit && (
            <>
              <div className="grid grid-cols-6 items-center gap-x-4 gap-y-1">
                <Label className="col-span-2 text-end">رمز عبور</Label>
                <Input
                  className="col-span-4"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-6 items-center gap-x-4 gap-y-1">
                <Label className="col-span-2 text-end">تکرار رمز</Label>
                <Input
                  className="col-span-4"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                  required
                />
              </div>
            </>
          )}
          {error && (
            <p className="text-sm text-destructive col-start-3">{error}</p>
          )}
        </form>
        <DialogFooter>
          <Button type="submit" form="user-form" disabled={submitting || isEdit}>
            {isEdit ? "ذخیره تغییرات" : submitting ? "در حال ایجاد..." : "ذخیره"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
