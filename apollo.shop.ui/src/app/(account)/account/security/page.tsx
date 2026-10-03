"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getApiErrorMessage } from "@/lib/api";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/account/change-password", { currentPassword, newPassword });
      toast.success("رمز عبور تغییر کرد");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">امنیت</h1>
        <p className="mt-1 text-sm text-muted-foreground">تغییر رمز عبور حساب</p>
      </div>
      <form className="space-y-4 rounded-xl border border-border p-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="current">رمز فعلی</Label>
          <Input
            id="current"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="next">رمز جدید</Label>
          <Input
            id="next"
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <Button disabled={loading}>{loading ? "در حال ذخیره..." : "تغییر رمز"}</Button>
      </form>
    </div>
  );
}
