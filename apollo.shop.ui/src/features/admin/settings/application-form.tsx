"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

const fieldClass = "h-9 px-3 text-sm md:text-sm";
const labelClass = "text-xs font-medium text-muted-foreground";
const areaClass = "min-h-[4.5rem] resize-none px-3 py-2 text-sm";

export function ApplicationForm() {
  const [form, setForm] = useState<SiteSettings["application"]>(
    defaultSiteSettings.application,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setForm(loadSiteSettings().application);
    setReady(true);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const current = loadSiteSettings();
    saveSiteSettings({ ...current, application: form });
    toast.success("تنظیمات اپلیکیشن ذخیره شد");
  }

  if (!ready) return null;

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="app-name" className={labelClass}>
            نام اپلیکیشن
          </Label>
          <Input
            id="app-name"
            className={fieldClass}
            value={form.appName}
            onChange={(e) => setForm((f) => ({ ...f, appName: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="app-url" className={labelClass}>
            آدرس سایت
          </Label>
          <Input
            id="app-url"
            className={fieldClass}
            dir="ltr"
            value={form.appUrl}
            onChange={(e) => setForm((f) => ({ ...f, appUrl: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="app-timezone" className={labelClass}>
            منطقه زمانی
          </Label>
          <Input
            id="app-timezone"
            className={fieldClass}
            dir="ltr"
            value={form.timezone}
            onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="app-locale" className={labelClass}>
            زبان / لوکال
          </Label>
          <Input
            id="app-locale"
            className={fieldClass}
            dir="ltr"
            value={form.locale}
            onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value }))}
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-2.5 py-2 sm:col-span-2 lg:col-span-2">
          <Label className="mb-0 text-sm font-normal">حالت تعمیرات</Label>
          <Switch
            checked={form.maintenanceMode}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, maintenanceMode: !!v }))
            }
          />
        </div>
        <div className="space-y-1 sm:col-span-2 lg:col-span-3">
          <Label htmlFor="maintenance-message" className={labelClass}>
            پیام حالت تعمیرات
          </Label>
          <Textarea
            id="maintenance-message"
            rows={2}
            className={areaClass}
            value={form.maintenanceMessage}
            onChange={(e) =>
              setForm((f) => ({ ...f, maintenanceMessage: e.target.value }))
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
