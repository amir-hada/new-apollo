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
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3.5">
        <h1 className="text-[15px] font-bold">امنیت و رمز عبور</h1>
        <p className="mt-1 text-xs text-muted-foreground">رمز عبور حساب خود را تغییر دهید</p>
      </div>
      <form className="max-w-lg space-y-4 p-4 sm:p-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="current">رمز فعلی</Label>
          <Input
            id="current"
            type="password"
            required
            className="h-10"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="next">رمز جدید</Label>
          <Input
            id="next"
            type="password"
            required
            minLength={8}
            className="h-10"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="h-10" disabled={loading}>
          {loading ? "در حال ذخیره..." : "تغییر رمز"}
        </Button>
      </form>
    </div>
  );
}
