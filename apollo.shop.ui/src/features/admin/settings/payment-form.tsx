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

const gateways = [
  { value: "mock", label: "آزمایشی (Mock)" },
  { value: "zarinpal", label: "زرین‌پال" },
  { value: "idpay", label: "آیدی‌پی" },
  { value: "nextpay", label: "نکست‌پی" },
] as const;

export function PaymentForm() {
  const [form, setForm] = useState<SiteSettings["payment"]>(
    defaultSiteSettings.payment,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setForm(loadSiteSettings().payment);
    setReady(true);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const current = loadSiteSettings();
    saveSiteSettings({ ...current, payment: form });
    toast.success("تنظیمات پرداخت ذخیره شد");
  }

  if (!ready) return null;

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="payment-gateway" className={labelClass}>
            درگاه پرداخت
          </Label>
          <div className="relative">
            <select
              id="payment-gateway"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-9 w-full appearance-none font-normal",
                "dark:bg-background dark:hover:bg-background",
              )}
              value={form.gateway}
              onChange={(e) =>
                setForm((f) => ({ ...f, gateway: e.target.value }))
              }
            >
              {gateways.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute inset-e-3 top-2 size-4 opacity-50" />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="merchant-id" className={labelClass}>
            مرچنت / API Key
          </Label>
          <Input
            id="merchant-id"
            className={fieldClass}
            dir="ltr"
            value={form.merchantId}
            onChange={(e) =>
              setForm((f) => ({ ...f, merchantId: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="callback-url" className={labelClass}>
            آدرس بازگشت
          </Label>
          <Input
            id="callback-url"
            className={fieldClass}
            dir="ltr"
            value={form.callbackUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, callbackUrl: e.target.value }))
            }
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-2.5 py-2 sm:col-span-2 lg:col-span-1">
          <Label className="mb-0 text-sm font-normal">حالت آزمایشی (Sandbox)</Label>
          <Switch
            checked={form.sandbox}
            onCheckedChange={(v) => setForm((f) => ({ ...f, sandbox: !!v }))}
          />
        </div>
        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="success-message" className={labelClass}>
            پیام موفقیت پرداخت
          </Label>
          <Textarea
            id="success-message"
            rows={2}
            className={areaClass}
            value={form.successMessage}
            onChange={(e) =>
              setForm((f) => ({ ...f, successMessage: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="failure-message" className={labelClass}>
            پیام خطای پرداخت
          </Label>
          <Textarea
            id="failure-message"
            rows={2}
            className={areaClass}
            value={form.failureMessage}
            onChange={(e) =>
              setForm((f) => ({ ...f, failureMessage: e.target.value }))
            }
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
