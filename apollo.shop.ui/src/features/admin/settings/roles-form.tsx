"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  defaultSiteSettings,
  loadSiteSettings,
  saveSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

const fieldClass = "h-9 px-3 text-sm md:text-sm";
const labelClass = "text-xs font-medium text-muted-foreground";

export function RolesForm() {
  const [form, setForm] = useState<SiteSettings["roles"]>(defaultSiteSettings.roles);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setForm(loadSiteSettings().roles);
    setReady(true);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const current = loadSiteSettings();
    saveSiteSettings({ ...current, roles: form });
    toast.success("تنظیمات نقش‌ها ذخیره شد");
  }

  if (!ready) return null;

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="role-admin" className={labelClass}>
            عنوان نقش مدیر
          </Label>
          <Input
            id="role-admin"
            className={fieldClass}
            value={form.adminLabel}
            onChange={(e) => setForm((f) => ({ ...f, adminLabel: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="role-manager" className={labelClass}>
            عنوان نقش مدیر فروشگاه
          </Label>
          <Input
            id="role-manager"
            className={fieldClass}
            value={form.managerLabel}
            onChange={(e) => setForm((f) => ({ ...f, managerLabel: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="role-support" className={labelClass}>
            عنوان نقش پشتیبانی
          </Label>
          <Input
            id="role-support"
            className={fieldClass}
            value={form.supportLabel}
            onChange={(e) => setForm((f) => ({ ...f, supportLabel: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="role-customer" className={labelClass}>
            عنوان نقش مشتری
          </Label>
          <Input
            id="role-customer"
            className={fieldClass}
            value={form.customerLabel}
            onChange={(e) => setForm((f) => ({ ...f, customerLabel: e.target.value }))}
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-2.5 py-2 sm:col-span-2 lg:col-span-2">
          <Label className="mb-0 text-sm font-normal">اجازه تعریف نقش سفارشی</Label>
          <Switch
            checked={form.allowCustomRoles}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, allowCustomRoles: !!v }))
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
