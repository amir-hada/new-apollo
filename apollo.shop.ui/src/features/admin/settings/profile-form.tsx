"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizePhoneInput } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { uploadShopAsset } from "@/lib/shop-settings-api";
import type { Profile } from "@/types/api";

const fieldClass = "h-9 px-3 text-sm md:text-sm";
const labelClass = "text-xs font-medium text-muted-foreground";

export function ProfileForm() {
  const queryClient = useQueryClient();
  const sessionUser = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    avatarUrl: "" as string | null,
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get<Profile>("/api/account/profile")).data,
  });

  useEffect(() => {
    if (!profile.data) return;
    setForm({
      firstName: profile.data.firstName,
      lastName: profile.data.lastName,
      phoneNumber: profile.data.phoneNumber || "",
      avatarUrl: profile.data.avatarUrl ?? null,
    });
  }, [profile.data]);

  const saveProfile = useMutation({
    mutationFn: async () =>
      (
        await api.put<Profile>("/api/account/profile", {
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNumber: form.phoneNumber || null,
          avatarUrl: form.avatarUrl || null,
        })
      ).data,
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      if (sessionUser) {
        useAuthStore.setState({
          user: {
            ...sessionUser,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            avatarUrl: data.avatarUrl,
          },
        });
      }
    },
  });

  async function onAvatarSelected(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadShopAsset(file, "avatar");
      setForm((f) => ({ ...f, avatarUrl: result.url }));
      toast.success("عکس پروفایل آپلود شد");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "آپلود ناموفق بود"));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const wantsPasswordChange =
      !!passwords.currentPassword ||
      !!passwords.newPassword ||
      !!passwords.confirmPassword;

    if (wantsPasswordChange) {
      if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
        toast.error("برای تغییر رمز، هر سه فیلد رمز را پر کنید");
        return;
      }
      if (passwords.newPassword.length < 8) {
        toast.error("رمز جدید باید حداقل ۸ کاراکتر باشد");
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast.error("رمز جدید و تکرار آن یکسان نیستند");
        return;
      }
    }

    setSaving(true);
    try {
      await saveProfile.mutateAsync();

      if (wantsPasswordChange) {
        await api.post("/api/account/change-password", {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        toast.success("پروفایل و رمز عبور ذخیره شد");
      } else {
        toast.success("تغییرات ذخیره شد");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (profile.isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      </div>
    );
  }

  if (profile.isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {getApiErrorMessage(profile.error)}
        <Button className="mt-3" variant="outline" onClick={() => profile.refetch()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="flex flex-wrap items-center gap-3">
        <Avatar className="size-12">
          {form.avatarUrl ? <AvatarImage src={form.avatarUrl} alt="پروفایل" /> : null}
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            className="h-8 px-2.5 text-xs"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            آپلود تصویر
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs"
            disabled={uploading || !form.avatarUrl}
            onClick={() => setForm((f) => ({ ...f, avatarUrl: null }))}
          >
            حذف
          </Button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            void onAvatarSelected(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="profile-first-name" className={labelClass}>
            نام
          </Label>
          <Input
            id="profile-first-name"
            className={fieldClass}
            value={form.firstName}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            required
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="profile-last-name" className={labelClass}>
            نام خانوادگی
          </Label>
          <Input
            id="profile-last-name"
            className={fieldClass}
            value={form.lastName}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            required
            autoComplete="family-name"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="profile-email" className={labelClass}>
            ایمیل
          </Label>
          <Input
            id="profile-email"
            value={profile.data?.email || ""}
            disabled
            dir="ltr"
            className={`${fieldClass} text-start`}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="profile-phone" className={labelClass}>
            شماره موبایل
          </Label>
          <Input
            id="profile-phone"
            value={form.phoneNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, phoneNumber: normalizePhoneInput(e.target.value) }))
            }
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            className={`${fieldClass} text-start`}
            placeholder="09121234567"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="current-password" className={labelClass}>
            رمز فعلی
          </Label>
          <Input
            id="current-password"
            type="password"
            className={fieldClass}
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="new-password" className={labelClass}>
            رمز جدید
          </Label>
          <Input
            id="new-password"
            type="password"
            className={fieldClass}
            minLength={8}
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, newPassword: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm-password" className={labelClass}>
            تکرار رمز جدید
          </Label>
          <Input
            id="confirm-password"
            type="password"
            className={fieldClass}
            minLength={8}
            autoComplete="new-password"
            value={passwords.confirmPassword}
            onChange={(e) =>
              setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end pt-0.5">
        <Button
          type="submit"
          className="h-10 px-5"
          disabled={saving || uploading}
        >
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </div>
    </form>
  );
}
