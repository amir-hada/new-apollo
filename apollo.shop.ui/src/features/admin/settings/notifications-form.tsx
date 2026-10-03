"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

export function NotificationsForm() {
  const [type, setType] = useState<"all" | "mentions" | "none">("all");
  const [communication, setCommunication] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [social, setSocial] = useState(true);
  const [mobile, setMobile] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    toast.success("تنظیمات اعلان‌ها ذخیره شد");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">
          درباره چه چیزهایی مطلع شوم...
        </Label>
        <RadioGroup
          value={type}
          onValueChange={(v) => v && setType(v as typeof type)}
          className="grid gap-2 sm:grid-cols-3"
        >
          <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2">
            <RadioGroupItem value="all" id="notify-all" />
            <Label htmlFor="notify-all" className="mb-0 text-sm font-normal">
              همه پیام‌های جدید
            </Label>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2">
            <RadioGroupItem value="mentions" id="notify-mentions" />
            <Label htmlFor="notify-mentions" className="mb-0 text-sm font-normal">
              پیام‌های مستقیم و منشن‌ها
            </Label>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-2">
            <RadioGroupItem value="none" id="notify-none" />
            <Label htmlFor="notify-none" className="mb-0 text-sm font-normal">
              هیچ‌کدام
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">
          اعلان‌های ایمیل
        </Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex flex-row items-center justify-between rounded-lg border px-3 py-2.5">
            <div className="space-y-0.5 pe-3">
              <Label className="mb-0 text-sm">ایمیل‌های ارتباطی</Label>
              <p className="text-xs text-muted-foreground">
                دریافت ایمیل درباره فعالیت حساب کاربری.
              </p>
            </div>
            <Switch
              checked={communication}
              onCheckedChange={(v) => setCommunication(!!v)}
            />
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border px-3 py-2.5">
            <div className="space-y-0.5 pe-3">
              <Label className="mb-0 text-sm">ایمیل‌های بازاریابی</Label>
              <p className="text-xs text-muted-foreground">
                دریافت ایمیل درباره محصولات و ویژگی‌های جدید.
              </p>
            </div>
            <Switch
              checked={marketing}
              onCheckedChange={(v) => setMarketing(!!v)}
            />
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border px-3 py-2.5">
            <div className="space-y-0.5 pe-3">
              <Label className="mb-0 text-sm">ایمیل‌های اجتماعی</Label>
              <p className="text-xs text-muted-foreground">
                دریافت ایمیل برای درخواست دوستی، دنبال کردن و موارد مشابه.
              </p>
            </div>
            <Switch checked={social} onCheckedChange={(v) => setSocial(!!v)} />
          </div>
          <div className="flex flex-row items-center justify-between rounded-lg border px-3 py-2.5">
            <div className="space-y-0.5 pe-3">
              <Label className="mb-0 text-sm">ایمیل‌های امنیتی</Label>
              <p className="text-xs text-muted-foreground">
                دریافت ایمیل درباره فعالیت و امنیت حساب.
              </p>
            </div>
            <Switch checked={true} disabled aria-readonly />
          </div>
        </div>
      </div>

      <div className="flex flex-row items-start gap-2 rounded-lg border border-border px-2.5 py-2">
        <Checkbox
          id="mobile-settings"
          checked={mobile}
          onCheckedChange={(v) => setMobile(v === true)}
        />
        <div className="space-y-0.5 leading-none">
          <Label htmlFor="mobile-settings" className="mb-0 text-sm">
            استفاده از تنظیمات متفاوت برای موبایل
          </Label>
          <p className="text-xs text-muted-foreground">
            می‌توانید اعلان‌های موبایل را در صفحه{" "}
            <Link
              href="/admin/settings?tab=notifications"
              className="underline decoration-dashed underline-offset-4 hover:decoration-solid"
            >
              تنظیمات موبایل
            </Link>{" "}
            مدیریت کنید.
          </p>
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
