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

const providers = [
  { value: "kavenegar", label: "کاوه‌نگار" },
  { value: "melipayamak", label: "ملی‌پیامک" },
  { value: "ghasedak", label: "قاصدک" },
  { value: "smsir", label: "SMS.ir" },
] as const;

export function SmsForm() {
  const [form, setForm] = useState<SiteSettings["sms"]>(defaultSiteSettings.sms);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setForm(loadSiteSettings().sms);
    setReady(true);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const current = loadSiteSettings();
    saveSiteSettings({ ...current, sms: form });
    toast.success("تنظیمات پیامک ذخیره شد");
  }

  if (!ready) return null;

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-2.5 py-2">
          <Label className="mb-0 text-sm font-normal">فعال‌سازی پیامک</Label>
          <Switch
            checked={form.enabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: !!v }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sms-provider" className={labelClass}>
            ارائه‌دهنده
          </Label>
          <div className="relative">
            <select
              id="sms-provider"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-9 w-full appearance-none font-normal",
                "dark:bg-background dark:hover:bg-background",
              )}
              value={form.provider}
              onChange={(e) =>
                setForm((f) => ({ ...f, provider: e.target.value }))
              }
            >
              {providers.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute inset-e-3 top-2 size-4 opacity-50" />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="sms-api-key" className={labelClass}>
            کلید API
          </Label>
          <Input
            id="sms-api-key"
            className={fieldClass}
            dir="ltr"
            type="password"
            autoComplete="off"
            value={form.apiKey}
            onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sms-sender" className={labelClass}>
            شماره فرستنده
          </Label>
          <Input
            id="sms-sender"
            className={fieldClass}
            dir="ltr"
            value={form.senderNumber}
            onChange={(e) =>
              setForm((f) => ({ ...f, senderNumber: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="otp-template" className={labelClass}>
            قالب پیامک تأیید (OTP)
          </Label>
          <Textarea
            id="otp-template"
            rows={2}
            className={areaClass}
            value={form.otpTemplate}
            onChange={(e) =>
              setForm((f) => ({ ...f, otpTemplate: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="order-template" className={labelClass}>
            قالب پیامک سفارش
          </Label>
          <Textarea
            id="order-template"
            rows={2}
            className={areaClass}
            value={form.orderTemplate}
            onChange={(e) =>
              setForm((f) => ({ ...f, orderTemplate: e.target.value }))
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
