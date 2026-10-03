"use client";

import { FormEvent, useEffect, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultSiteSettings,
  loadSiteSettings,
  saveSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";
import { cn } from "@/lib/utils";

const fieldClass = "h-9 px-3 text-sm md:text-sm";
const labelClass = "text-xs font-medium text-muted-foreground";
const areaClass = "min-h-[4.5rem] resize-none px-3 py-2 text-sm";

const shippingMethods = [
  { value: "post", label: "پست پیشتاز / سفارشی" },
  { value: "tipax", label: "تیپاکس" },
  { value: "courier", label: "پیک شهری" },
  { value: "freight", label: "باربری" },
  { value: "pickup", label: "تحویل حضوری" },
] as const;

export function LogisticsForm() {
  const [form, setForm] = useState<SiteSettings["logistics"]>(
    defaultSiteSettings.logistics,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setForm(loadSiteSettings().logistics);
    setReady(true);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const current = loadSiteSettings();
    saveSiteSettings({ ...current, logistics: form });
    toast.success("تنظیمات لجستیک ذخیره شد");
  }

  if (!ready) return null;

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
          <Label htmlFor="shipping-method" className={labelClass}>
            روش ارسال پیش‌فرض
          </Label>
          <div className="relative">
            <select
              id="shipping-method"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-9 w-full appearance-none font-normal",
                "dark:bg-background dark:hover:bg-background",
              )}
              value={form.defaultMethod}
              disabled={!form.enabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, defaultMethod: e.target.value }))
              }
            >
              {shippingMethods.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute inset-e-3 top-2 size-4 opacity-50" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-2.5 py-2">
          <Label className="mb-0 text-sm font-normal">پرداخت در محل (COD)</Label>
          <Switch
            checked={form.codEnabled}
            disabled={!form.enabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, codEnabled: !!v }))}
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
            onChange={(e) =>
              setForm((f) => ({ ...f, flatRate: e.target.value }))
            }
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
            placeholder="500000"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="cod-fee" className={labelClass}>
            کارمزد پرداخت در محل (تومان)
          </Label>
          <Input
            id="cod-fee"
            className={fieldClass}
            dir="ltr"
            inputMode="numeric"
            disabled={!form.enabled || !form.codEnabled}
            value={form.codFee}
            onChange={(e) => setForm((f) => ({ ...f, codFee: e.target.value }))}
            placeholder="0"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="days-min" className={labelClass}>
            حداقل روز تحویل
          </Label>
          <Input
            id="days-min"
            className={fieldClass}
            dir="ltr"
            inputMode="numeric"
            disabled={!form.enabled}
            value={form.estimatedDaysMin}
            onChange={(e) =>
              setForm((f) => ({ ...f, estimatedDaysMin: e.target.value }))
            }
            placeholder="2"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="days-max" className={labelClass}>
            حداکثر روز تحویل
          </Label>
          <Input
            id="days-max"
            className={fieldClass}
            dir="ltr"
            inputMode="numeric"
            disabled={!form.enabled}
            value={form.estimatedDaysMax}
            onChange={(e) =>
              setForm((f) => ({ ...f, estimatedDaysMax: e.target.value }))
            }
            placeholder="5"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="origin-province" className={labelClass}>
            استان مبدأ ارسال
          </Label>
          <Input
            id="origin-province"
            className={fieldClass}
            disabled={!form.enabled}
            value={form.originProvince}
            onChange={(e) =>
              setForm((f) => ({ ...f, originProvince: e.target.value }))
            }
            placeholder="تهران"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="origin-city" className={labelClass}>
            شهر مبدأ ارسال
          </Label>
          <Input
            id="origin-city"
            className={fieldClass}
            disabled={!form.enabled}
            value={form.originCity}
            onChange={(e) =>
              setForm((f) => ({ ...f, originCity: e.target.value }))
            }
            placeholder="تهران"
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

        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="shipping-policy" className={labelClass}>
            سیاست مرجوعی / آسیب در ارسال
          </Label>
          <Textarea
            id="shipping-policy"
            rows={2}
            className={areaClass}
            disabled={!form.enabled}
            value={form.returnPolicy}
            onChange={(e) =>
              setForm((f) => ({ ...f, returnPolicy: e.target.value }))
            }
            placeholder="شرایط مرجوعی کالا در صورت آسیب هنگام حمل"
          />
        </div>
      </div>

      <div className="flex justify-end pt-0.5">
        <Button type="submit" className="h-10 px-5">
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  );
}
