"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  defaultSiteSettings,
  loadSiteSettings,
  saveSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

const permissionItems: {
  key: keyof SiteSettings["permissions"];
  label: string;
  desc: string;
}[] = [
  {
    key: "manageProducts",
    label: "مدیریت محصولات",
    desc: "ایجاد، ویرایش و حذف محصولات و دسته‌ها.",
  },
  {
    key: "manageOrders",
    label: "مدیریت سفارش‌ها",
    desc: "مشاهده و تغییر وضعیت سفارش‌ها.",
  },
  {
    key: "manageUsers",
    label: "مدیریت کاربران",
    desc: "ایجاد و ویرایش کاربران پنل و مشتریان.",
  },
  {
    key: "manageSettings",
    label: "مدیریت تنظیمات",
    desc: "دسترسی به تنظیمات فروشگاه و سیستم.",
  },
  {
    key: "manageContent",
    label: "مدیریت محتوا",
    desc: "بلاگ، تیکت‌ها و محتوای سایت.",
  },
  {
    key: "viewReports",
    label: "مشاهده گزارش‌ها",
    desc: "دسترسی به داشبورد و گزارش‌های فروش.",
  },
];

export function PermissionsForm() {
  const [form, setForm] = useState<SiteSettings["permissions"]>(
    defaultSiteSettings.permissions,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setForm(loadSiteSettings().permissions);
    setReady(true);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const current = loadSiteSettings();
    saveSiteSettings({ ...current, permissions: form });
    toast.success("دسترسی‌ها ذخیره شد");
  }

  if (!ready) return null;

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="grid gap-2 sm:grid-cols-2">
        {permissionItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
          >
            <div className="space-y-0.5 pe-2">
              <Label className="mb-0 text-sm">{item.label}</Label>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={form[item.key]}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, [item.key]: !!v }))
              }
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-0.5">
        <Button type="submit" className="h-10 px-5">
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  );
}
