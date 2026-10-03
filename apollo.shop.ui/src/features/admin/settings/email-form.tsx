"use client";

import { FormEvent, useEffect, useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  defaultSiteSettings,
  loadSiteSettings,
  saveSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";
import { cn } from "@/lib/utils";

const fieldClass = "h-9 px-3 text-sm md:text-sm";
const labelClass = "text-xs font-medium text-muted-foreground";

const providers = [
  { value: "smtp", label: "SMTP" },
  { value: "sendgrid", label: "SendGrid" },
  { value: "mailgun", label: "Mailgun" },
  { value: "resend", label: "Resend" },
] as const;

export function EmailForm() {
  const [form, setForm] = useState<SiteSettings["email"]>(defaultSiteSettings.email);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setForm(loadSiteSettings().email);
    setReady(true);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const current = loadSiteSettings();
    saveSiteSettings({ ...current, email: form });
    toast.success("تنظیمات ایمیل ذخیره شد");
  }

  if (!ready) return null;

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-2.5 py-2">
          <Label className="mb-0 text-sm font-normal">فعال‌سازی ایمیل</Label>
          <Switch
            checked={form.enabled}
            onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: !!v }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email-provider" className={labelClass}>
            ارائه‌دهنده
          </Label>
          <div className="relative">
            <select
              id="email-provider"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-9 w-full appearance-none font-normal",
                "dark:bg-background dark:hover:bg-background",
              )}
              value={form.provider}
              onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
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
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-2.5 py-2">
          <Label className="mb-0 text-sm font-normal">SSL / TLS</Label>
          <Switch
            checked={form.useSsl}
            onCheckedChange={(v) => setForm((f) => ({ ...f, useSsl: !!v }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email-host" className={labelClass}>
            هاست SMTP
          </Label>
          <Input
            id="email-host"
            className={fieldClass}
            dir="ltr"
            value={form.host}
            onChange={(e) => setForm((f) => ({ ...f, host: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email-port" className={labelClass}>
            پورت
          </Label>
          <Input
            id="email-port"
            className={fieldClass}
            dir="ltr"
            value={form.port}
            onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email-username" className={labelClass}>
            نام کاربری
          </Label>
          <Input
            id="email-username"
            className={fieldClass}
            dir="ltr"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email-password" className={labelClass}>
            رمز عبور
          </Label>
          <Input
            id="email-password"
            type="password"
            className={fieldClass}
            dir="ltr"
            autoComplete="off"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email-from-name" className={labelClass}>
            نام فرستنده
          </Label>
          <Input
            id="email-from-name"
            className={fieldClass}
            value={form.fromName}
            onChange={(e) => setForm((f) => ({ ...f, fromName: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email-from-address" className={labelClass}>
            ایمیل فرستنده
          </Label>
          <Input
            id="email-from-address"
            type="email"
            className={fieldClass}
            dir="ltr"
            value={form.fromAddress}
            onChange={(e) => setForm((f) => ({ ...f, fromAddress: e.target.value }))}
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
