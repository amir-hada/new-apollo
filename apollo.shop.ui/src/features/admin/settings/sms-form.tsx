"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getApiErrorMessage } from "@/lib/api";
import { api } from "@/lib/api";
import { SHOP_SETTINGS_QUERY_KEY } from "@/lib/shop-settings-api";
import type { ShopSettings } from "@/types/api";

export function SmsForm() {
  const queryClient = useQueryClient();
  const settings = useQuery({
    queryKey: SHOP_SETTINGS_QUERY_KEY,
    queryFn: async () => (await api.get<ShopSettings>("/api/shop-settings")).data,
  });

  const [otpEnabled, setOtpEnabled] = useState(true);
  const [orderEnabled, setOrderEnabled] = useState(true);

  useEffect(() => {
    if (!settings.data) return;
    setOtpEnabled(settings.data.smsOtpEnabled ?? true);
    setOrderEnabled(settings.data.smsOrderEnabled ?? true);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () =>
      (
        await api.put<ShopSettings>("/api/admin/shop-settings/sms", {
          smsOtpEnabled: otpEnabled,
          smsOrderEnabled: orderEnabled,
        })
      ).data,
    onSuccess: (data) => {
      queryClient.setQueryData(SHOP_SETTINGS_QUERY_KEY, data);
      toast.success("تنظیمات پنل پیامکی ذخیره شد");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    save.mutate();
  }

  if (settings.isLoading) {
    return <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>;
  }

  if (settings.isError) {
    return (
      <div className="text-sm text-destructive">
        {getApiErrorMessage(settings.error)}
        <Button className="mt-3" variant="outline" onClick={() => settings.refetch()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm leading-7 text-muted-foreground">
        اعتبار و کلید API پیامک به‌صورت مشترک از پنل ادمین آپولو مدیریت می‌شود. اینجا فقط می‌توانید
        قابلیت‌های این فروشگاه را روشن یا خاموش کنید.
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
          <div>
            <Label className="mb-0 text-sm font-normal">پیامک OTP ورود</Label>
            <p className="text-xs text-muted-foreground">ارسال کد تأیید هنگام ورود/ثبت‌نام</p>
          </div>
          <Switch checked={otpEnabled} onCheckedChange={(v) => setOtpEnabled(!!v)} />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
          <div>
            <Label className="mb-0 text-sm font-normal">پیامک ثبت سفارش</Label>
            <p className="text-xs text-muted-foreground">اطلاع به مشتری بعد از ثبت سفارش</p>
          </div>
          <Switch checked={orderEnabled} onCheckedChange={(v) => setOrderEnabled(!!v)} />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" className="h-10 px-5" disabled={save.isPending}>
          {save.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </div>
    </form>
  );
}
