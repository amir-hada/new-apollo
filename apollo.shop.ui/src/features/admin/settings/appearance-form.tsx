"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import {
  applyShopPrimaryColor,
  DEFAULT_SHOP_PRIMARY,
  normalizeHexColor,
  SHOP_PRIMARY_PRESETS,
} from "@/lib/shop-primary-color";
import { SHOP_SETTINGS_QUERY_KEY } from "@/lib/shop-settings-api";
import { cn } from "@/lib/utils";
import type { ShopSettings } from "@/types/api";

const fonts = ["inter", "manrope", "system"] as const;
const fieldClass = "h-9 px-3 text-sm md:text-sm";

export function AppearanceForm() {
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const [font, setFont] = useState<(typeof fonts)[number]>("inter");
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(
    theme === "dark" ? "dark" : "light",
  );
  const [primaryColor, setPrimaryColorState] = useState(DEFAULT_SHOP_PRIMARY);

  const settings = useQuery({
    queryKey: SHOP_SETTINGS_QUERY_KEY,
    queryFn: async () => (await api.get<ShopSettings>("/api/shop-settings")).data,
  });

  useEffect(() => {
    if (!settings.data) return;
    setPrimaryColorState(settings.data.primaryColor || DEFAULT_SHOP_PRIMARY);
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!settings.data) throw new Error("تنظیمات فروشگاه یافت نشد");
      const color = normalizeHexColor(primaryColor) || DEFAULT_SHOP_PRIMARY;
      const { data } = await api.put<ShopSettings>("/api/admin/shop-settings", {
        shopTitle: settings.data.shopTitle,
        browserTitle: settings.data.browserTitle,
        logoUrl: settings.data.logoUrl ?? null,
        favIconUrl: settings.data.favIconUrl ?? null,
        currency: settings.data.currency,
        supportPhone: settings.data.supportPhone ?? null,
        supportEmail: settings.data.supportEmail ?? null,
        address: settings.data.address ?? null,
        description: settings.data.description ?? null,
        metaDescription: settings.data.metaDescription ?? null,
        primaryColor: color,
      });
      return data;
    },
    onSuccess: (data) => {
      const color =
        normalizeHexColor(data.primaryColor) ||
        normalizeHexColor(primaryColor) ||
        DEFAULT_SHOP_PRIMARY;
      queryClient.setQueryData(SHOP_SETTINGS_QUERY_KEY, {
        ...data,
        primaryColor: color,
      });
      applyShopPrimaryColor(color, selectedTheme === "dark");
      setTheme(selectedTheme);
      toast.success("ترجیحات ظاهر ذخیره شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  function setPrimaryColor(value: string) {
    const normalized = normalizeHexColor(value) || DEFAULT_SHOP_PRIMARY;
    setPrimaryColorState(normalized);
    applyShopPrimaryColor(normalized, selectedTheme === "dark");
  }

  if (settings.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-3"
    >
      <div className="space-y-1">
        <Label htmlFor="font" className="text-xs font-medium text-muted-foreground">
          فونت
        </Label>
        <div className="relative w-full max-w-xs">
          <select
            id="font"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 w-full appearance-none font-normal capitalize",
              "dark:bg-background dark:hover:bg-background",
            )}
            value={font}
            onChange={(e) => setFont(e.target.value as (typeof fonts)[number])}
          >
            {fonts.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute inset-e-3 top-2 size-4 opacity-50" />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">تم</Label>
        <RadioGroup
          value={selectedTheme}
          onValueChange={(v) => v && setSelectedTheme(v as "light" | "dark")}
          className="grid max-w-md grid-cols-2 gap-3 pt-0.5"
        >
          <Label
            className={cn(
              "mb-0 cursor-pointer [&:has([data-checked])>div]:border-primary",
            )}
          >
            <RadioGroupItem value="light" className="sr-only" />
            <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
              <div className="space-y-1.5 rounded-sm bg-[#ecedef] p-1.5">
                <div className="space-y-1.5 rounded-md bg-white p-1.5 shadow-xs">
                  <div className="h-1.5 w-16 rounded-lg bg-[#ecedef]" />
                  <div className="h-1.5 w-20 rounded-lg bg-[#ecedef]" />
                </div>
                <div className="flex items-center gap-1.5 rounded-md bg-white p-1.5 shadow-xs">
                  <div className="size-3 rounded-full bg-[#ecedef]" />
                  <div className="h-1.5 w-20 rounded-lg bg-[#ecedef]" />
                </div>
              </div>
            </div>
            <span className="block w-full py-1.5 text-center text-xs font-normal">
              روشن
            </span>
          </Label>

          <Label
            className={cn(
              "mb-0 cursor-pointer [&:has([data-checked])>div]:border-primary",
            )}
          >
            <RadioGroupItem value="dark" className="sr-only" />
            <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
              <div className="space-y-1.5 rounded-sm bg-slate-950 p-1.5">
                <div className="space-y-1.5 rounded-md bg-slate-800 p-1.5 shadow-xs">
                  <div className="h-1.5 w-16 rounded-lg bg-slate-400" />
                  <div className="h-1.5 w-20 rounded-lg bg-slate-400" />
                </div>
                <div className="flex items-center gap-1.5 rounded-md bg-slate-800 p-1.5 shadow-xs">
                  <div className="size-3 rounded-full bg-slate-400" />
                  <div className="h-1.5 w-20 rounded-lg bg-slate-400" />
                </div>
              </div>
            </div>
            <span className="block w-full py-1.5 text-center text-xs font-normal">
              تاریک
            </span>
          </Label>
        </RadioGroup>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium text-muted-foreground">رنگ اصلی</Label>
        <p className="text-xs text-muted-foreground">
          این رنگ برای دکمه‌ها، لینک‌ها و المان‌های اصلی فروشگاه استفاده می‌شود.
        </p>
        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
          <label className="relative flex size-9 cursor-pointer overflow-hidden rounded-lg border border-border shadow-sm">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="absolute inset-0 size-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-0 p-0"
              aria-label="انتخاب رنگ اصلی"
            />
          </label>
          <Input
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            dir="ltr"
            className={`${fieldClass} max-w-32 text-start font-mono uppercase`}
            maxLength={7}
          />
          <div className="flex flex-wrap gap-1.5">
            {SHOP_PRIMARY_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => setPrimaryColor(c)}
                className={cn(
                  "size-7 rounded-full border border-border transition-transform hover:scale-105",
                  primaryColor === c && "ring-2 ring-foreground ring-offset-2",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground">پیش‌نمایش:</span>
          <Button
            type="button"
            size="sm"
            className="h-8 px-2.5 text-xs"
            style={{ backgroundColor: primaryColor, color: "#fff" }}
          >
            دکمه اصلی
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            دکمه ثانویه
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-0.5">
        <Button
          type="submit"
          className="h-10 px-5"
          disabled={save.isPending || !settings.data}
        >
          {save.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </div>
    </form>
  );
}
