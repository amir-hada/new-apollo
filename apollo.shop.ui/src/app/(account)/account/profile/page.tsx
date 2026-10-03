"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import type { Profile } from "@/types/api";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const setSessionUser = useAuthStore((s) => s.user);
  const [form, setForm] = useState({ firstName: "", lastName: "", phoneNumber: "" });

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get<Profile>("/api/account/profile")).data,
  });

  useEffect(() => {
    if (profile.data) {
      setForm({
        firstName: profile.data.firstName,
        lastName: profile.data.lastName,
        phoneNumber: profile.data.phoneNumber || "",
      });
    }
  }, [profile.data]);

  const save = useMutation({
    mutationFn: async () =>
      (
        await api.put<Profile>("/api/account/profile", {
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber || null,
        })
      ).data,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      useAuthStore.setState({
        user: setSessionUser
          ? { ...setSessionUser, firstName: data.firstName, lastName: data.lastName, phoneNumber: data.phoneNumber }
          : data,
      });
      toast.success("پروفایل ذخیره شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (profile.isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">پروفایل</h1>
        <p className="mt-1 text-sm text-muted-foreground">{profile.data?.email}</p>
      </div>
      <form
        className="space-y-4 rounded-xl border border-border p-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <div>
          <Label htmlFor="firstName">نام</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">نام خانوادگی</Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">موبایل</Label>
          <Input
            id="phone"
            value={form.phoneNumber}
            onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
          />
        </div>
        <Button disabled={save.isPending}>{save.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}</Button>
      </form>
    </div>
  );
}
