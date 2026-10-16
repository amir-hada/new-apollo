"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatPhoneDisplay,
  normalizePhoneInput,
} from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { cn, getDisplayNameInitials } from "@/lib/utils";
import type { Profile } from "@/types/api";

type ProfileForm = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatarUrl: string | null;
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    avatarUrl: null,
  });
  const [dirty, setDirty] = useState(false);

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get<Profile>("/api/account/profile")).data,
  });

  useEffect(() => {
    if (!profile.data || dirty) return;
    setForm({
      firstName: profile.data.firstName ?? "",
      lastName: profile.data.lastName ?? "",
      phoneNumber: profile.data.phoneNumber ?? "",
      avatarUrl: profile.data.avatarUrl ?? null,
    });
  }, [profile.data, dirty]);

  const save = useMutation({
    mutationFn: async () => {
      const phone = normalizePhoneInput(form.phoneNumber);
      if (phone && phone.length !== 11) {
        throw new Error("شماره موبایل باید ۱۱ رقم باشد.");
      }
      return (
        await api.put<Profile>("/api/account/profile", {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phoneNumber: phone || null,
          avatarUrl: form.avatarUrl,
        })
      ).data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      setDirty(false);
      setForm({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        phoneNumber: data.phoneNumber ?? "",
        avatarUrl: data.avatarUrl ?? null,
      });
      const current = useAuthStore.getState().user;
      if (current) {
        useAuthStore.setState({
          user: {
            ...current,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            avatarUrl: data.avatarUrl,
          },
        });
      }
      toast.success("پروفایل با موفقیت ذخیره شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "ذخیره پروفایل ناموفق بود")),
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("file", file);
      return (await api.post<Profile>("/api/account/avatar", body)).data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      setForm((f) => ({ ...f, avatarUrl: data.avatarUrl ?? null }));
      const current = useAuthStore.getState().user;
      if (current) {
        useAuthStore.setState({
          user: { ...current, avatarUrl: data.avatarUrl },
        });
      }
      toast.success("تصویر پروفایل به‌روز شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "آپلود تصویر ناموفق بود")),
  });

  function patch<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setDirty(true);
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (profile.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (profile.isError) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-destructive">
        {getApiErrorMessage(profile.error, "بارگذاری پروفایل ناموفق بود")}
        <Button className="mt-3" variant="outline" onClick={() => profile.refetch()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim() || "کاربر";

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="rounded-xl border border-border bg-card px-4 py-3.5">
        <h1 className="text-[15px] font-bold">اطلاعات حساب کاربری</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          نام، موبایل و تصویر پروفایل خود را مدیریت کنید.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-5">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <Avatar className="size-24">
                <AvatarImage src={form.avatarUrl ?? undefined} alt={fullName} />
                <AvatarFallback className="text-lg">
                  {getDisplayNameInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                disabled={uploadAvatar.isPending}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "absolute -bottom-1 -start-1 inline-flex size-9 items-center justify-center rounded-xl border border-border bg-background text-foreground shadow-sm hover:bg-muted",
                  uploadAvatar.isPending && "opacity-60",
                )}
                aria-label="تغییر تصویر پروفایل"
              >
                {uploadAvatar.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) {
                    toast.error("حداکثر حجم تصویر ۲ مگابایت است.");
                    return;
                  }
                  uploadAvatar.mutate(file);
                }}
              />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">{fullName}</p>
              <p className="break-all text-xs text-muted-foreground">
                {profile.data?.email}
              </p>
            </div>
          </div>
        </section>

        <form
          className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-6"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">نام</Label>
              <Input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={(e) => patch("firstName", e.target.value)}
                required
                className="h-10"
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">نام خانوادگی</Label>
              <Input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={(e) => patch("lastName", e.target.value)}
                required
                className="h-10"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              value={profile.data?.email ?? ""}
              disabled
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              ایمیل قابل تغییر نیست.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">موبایل</Label>
            <Input
              id="phone"
              name="phone"
              inputMode="numeric"
              value={formatPhoneDisplay(form.phoneNumber)}
              onChange={(e) => patch("phoneNumber", normalizePhoneInput(e.target.value))}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              className="h-10"
              autoComplete="tel"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              type="submit"
              disabled={save.isPending || !dirty}
              className="h-10 min-w-36"
            >
              {save.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
            {dirty && (
              <Button
                type="button"
                variant="outline"
                className="h-10"
                disabled={save.isPending}
                onClick={() => {
                  if (!profile.data) return;
                  setForm({
                    firstName: profile.data.firstName ?? "",
                    lastName: profile.data.lastName ?? "",
                    phoneNumber: profile.data.phoneNumber ?? "",
                    avatarUrl: profile.data.avatarUrl ?? null,
                  });
                  setDirty(false);
                }}
              >
                انصراف
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
