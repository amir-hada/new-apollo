"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api, getApiErrorMessage } from "@/lib/api";
import { SHOP_SETTINGS_QUERY_KEY } from "@/lib/shop-settings-api";
import type { ShopSettings } from "@/types/api";

const fieldClass = "h-9 px-3 text-sm md:text-sm";
const labelClass = "text-xs font-medium text-muted-foreground";
const areaClass = "min-h-[4.5rem] resize-none px-3 py-2 text-sm";

type LogisticsFormState = {
  enabled: boolean;
  flatRate: string;
  freeShippingThreshold: string;
  customerNote: string;
};

function toForm(settings?: ShopSettings | null): LogisticsFormState {
  return {
    enabled: settings?.shippingEnabled ?? true,
    flatRate: String(settings?.flatShippingRate ?? 50000),
    freeShippingThreshold:
      settings?.freeShippingThreshold != null && settings.freeShippingThreshold > 0
        ? String(settings.freeShippingThreshold)
        : "",
    customerNote: settings?.shippingCustomerNote ?? "",
  };
}

export function LogisticsForm() {
  const queryClient = useQueryClient();
  const settings = useQuery({
    queryKey: SHOP_SETTINGS_QUERY_KEY,
    queryFn: async () => (await api.get<ShopSettings>("/api/shop-settings")).data,
  });

  const [form, setForm] = useState<LogisticsFormState>(toForm());

  useEffect(() => {
    if (!settings.data) return;
    setForm(toForm(settings.data));
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const flatRate = Number(form.flatRate.replace(/,/g, "")) || 0;
      const thresholdRaw = form.freeShippingThreshold.trim();
      const freeShippingThreshold =
        thresholdRaw === "" ? null : Number(thresholdRaw.replace(/,/g, "")) || 0;

      const { data } = await api.put<ShopSettings>("/api/admin/shop-settings/logistics", {
        shippingEnabled: form.enabled,
        flatShippingRate: flatRate,
        freeShippingThreshold:
          freeShippingThreshold != null && freeShippingThreshold > 0
            ? freeShippingThreshold
            : null,
        shippingCustomerNote: form.customerNote.trim() || null,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SHOP_SETTINGS_QUERY_KEY, data);
      toast.success("تنظیمات لجستیک ذخیره شد");
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
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-2.5 py-2 sm:col-span-2 lg:col-span-1">
          <Label className="mb-0 text-sm font-normal">فعال بودن ارسال</Label>
          <Switch
            checked={form.enabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: !!v }))}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="flat-rate" className={labelClass}>
            هزینه ارسال ثابت (تومان)
          </Label>
          <Input
            id="flat-rate"
            className={fieldClass}
            dir="ltr"
            inputMode="numeric"
            disabled={!form.enabled}
            value={form.flatRate}
            onChange={(e) => setForm((f) => ({ ...f, flatRate: e.target.value }))}
            placeholder="50000"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="free-threshold" className={labelClass}>
            آستانه ارسال رایگان (تومان)
          </Label>
          <Input
            id="free-threshold"
            className={fieldClass}
            dir="ltr"
            inputMode="numeric"
            disabled={!form.enabled}
            value={form.freeShippingThreshold}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                freeShippingThreshold: e.target.value,
              }))
            }
            placeholder="500000 — خالی = بدون آستانه"
          />
        </div>

        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="shipping-note" className={labelClass}>
            توضیحات ارسال (نمایش به مشتری)
          </Label>
          <Textarea
            id="shipping-note"
            rows={2}
            className={areaClass}
            disabled={!form.enabled}
            value={form.customerNote}
            onChange={(e) =>
              setForm((f) => ({ ...f, customerNote: e.target.value }))
            }
            placeholder="مثلاً: ارسال رایگان برای خرید بالای ۵۰۰ هزار تومان"
          />
        </div>
      </div>

      <div className="flex justify-end pt-0.5">
        <Button type="submit" className="h-10 px-5" disabled={save.isPending}>
          {save.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </div>
    </form>
  );
}
