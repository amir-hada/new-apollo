"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CurrencySelect } from "@/features/admin/settings/currency-select";
import { api, getApiErrorMessage } from "@/lib/api";
import { DEFAULT_SHOP_PRIMARY } from "@/lib/shop-primary-color";
import { setActiveShopCurrency } from "@/lib/shop-currency";
import { SHOP_INDUSTRY_OPTIONS } from "@/lib/shop-industry-presets";
import {
  SHOP_SETTINGS_QUERY_KEY,
  uploadShopAsset,
} from "@/lib/shop-settings-api";
import type { ShopSettings, UpdateShopSettingsRequest } from "@/types/api";

type FormState = UpdateShopSettingsRequest;

const emptyForm: FormState = {
  shopTitle: "",
  browserTitle: "",
  logoUrl: null,
  favIconUrl: null,
  currency: "تومان",
  supportPhone: null,
  supportEmail: null,
  address: null,
  description: null,
  metaDescription: null,
  primaryColor: DEFAULT_SHOP_PRIMARY,
  industryKey: "general",
};

const fieldClass = "h-9 px-3 text-sm md:text-sm";

export function StoreForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const favInputRef = useRef<HTMLInputElement>(null);

  const settings = useQuery({
    queryKey: SHOP_SETTINGS_QUERY_KEY,
    queryFn: async () => (await api.get<ShopSettings>("/api/shop-settings")).data,
  });

  useEffect(() => {
    if (!settings.data) return;
    setForm({
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
      primaryColor: settings.data.primaryColor || DEFAULT_SHOP_PRIMARY,
      industryKey: settings.data.industryKey || "general",
    });
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () =>
      (await api.put<ShopSettings>("/api/admin/shop-settings", form)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(SHOP_SETTINGS_QUERY_KEY, data);
      setActiveShopCurrency(data.currency);
      void queryClient.invalidateQueries({ queryKey: SHOP_SETTINGS_QUERY_KEY });
      toast.success("تغییرات ذخیره شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function onUpload(kind: "logo" | "favicon", file: File | undefined) {
    if (!file) return;
    setUploading(kind);
    try {
      const result = await uploadShopAsset(file, kind);
      setForm((f) =>
        kind === "logo"
          ? { ...f, logoUrl: result.url }
          : { ...f, favIconUrl: result.url },
      );
      toast.success(kind === "logo" ? "لوگو آپلود شد" : "فاوآیکون آپلود شد");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "آپلود ناموفق بود"));
    } finally {
      setUploading(null);
    }
  }

  if (settings.isLoading) {
    return (
      <div className="grid gap-3 lg:grid-cols-12">
        <Skeleton className="h-9 lg:col-span-4" />
        <Skeleton className="h-9 lg:col-span-4" />
        <Skeleton className="h-9 lg:col-span-4" />
        <Skeleton className="h-16 lg:col-span-6" />
        <Skeleton className="h-16 lg:col-span-6" />
      </div>
    );
  }

  if (settings.isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {getApiErrorMessage(settings.error)}
        <Button className="mt-3" variant="outline" onClick={() => settings.refetch()}>
          تلاش مجدد
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="عنوان فروشگاه" htmlFor="shopTitle">
          <Input
            id="shopTitle"
            className={fieldClass}
            value={form.shopTitle}
            onChange={(e) => setForm((f) => ({ ...f, shopTitle: e.target.value }))}
            required
          />
        </Field>
        <Field label="عنوان تب مرورگر" htmlFor="browserTitle">
          <Input
            id="browserTitle"
            className={fieldClass}
            value={form.browserTitle}
            onChange={(e) => setForm((f) => ({ ...f, browserTitle: e.target.value }))}
            required
          />
        </Field>
        <Field label="واحد پول" htmlFor="currency">
          <CurrencySelect
            id="currency"
            value={form.currency === "ریال" ? "ریال" : "تومان"}
            onChange={(currency) => {
              setForm((f) => ({ ...f, currency }));
              setActiveShopCurrency(currency);
              queryClient.setQueryData<ShopSettings>(SHOP_SETTINGS_QUERY_KEY, (prev) =>
                prev ? { ...prev, currency } : prev,
              );
            }}
          />
          <p className="text-[11px] text-muted-foreground">
            قیمت‌ها همیشه به‌صورت تومان ذخیره می‌شوند؛ انتخاب ریال فقط نمایش را ×۱۰ می‌کند.
          </p>
        </Field>
        <Field label="نوع فروشگاه" htmlFor="industryKey">
          <select
            id="industryKey"
            className={`${fieldClass} w-full rounded-md border border-input bg-background`}
            value={form.industryKey || "general"}
            onChange={(e) =>
              setForm((f) => ({ ...f, industryKey: e.target.value || "general" }))
            }
          >
            {SHOP_INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.title}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-muted-foreground">
            با تغییر نوع فروشگاه، هدر و دسته‌های پیش‌فرض (به‌همراه «سایر») همگام
            می‌شوند. دسته‌هایی که خودتان بسازید دست‌نخورده می‌مانند.
          </p>
        </Field>
        <Field label="تلفن پشتیبانی" htmlFor="supportPhone">
          <Input
            id="supportPhone"
            className={fieldClass}
            value={form.supportPhone ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, supportPhone: e.target.value || null }))
            }
          />
        </Field>
        <Field label="ایمیل پشتیبانی" htmlFor="supportEmail">
          <Input
            id="supportEmail"
            type="email"
            className={fieldClass}
            value={form.supportEmail ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, supportEmail: e.target.value || null }))
            }
          />
        </Field>
        <Field label="آدرس" htmlFor="address">
          <Input
            id="address"
            className={fieldClass}
            value={form.address ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value || null }))}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AssetUploader
          label="لوگو"
          url={form.logoUrl}
          uploading={uploading === "logo"}
          inputRef={logoInputRef}
          onPick={() => logoInputRef.current?.click()}
          onClear={() => setForm((f) => ({ ...f, logoUrl: null }))}
          onFile={(file) => onUpload("logo", file)}
        />
        <AssetUploader
          label="فاوآیکون"
          url={form.favIconUrl}
          uploading={uploading === "favicon"}
          inputRef={favInputRef}
          onPick={() => favInputRef.current?.click()}
          onClear={() => setForm((f) => ({ ...f, favIconUrl: null }))}
          onFile={(file) => onUpload("favicon", file)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="توضیحات فروشگاه" htmlFor="description">
          <Textarea
            id="description"
            rows={2}
            className="min-h-[4.5rem] resize-none px-3 py-2 text-sm"
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value || null }))
            }
          />
        </Field>
        <Field label="متای توضیحات (SEO)" htmlFor="metaDescription">
          <Textarea
            id="metaDescription"
            rows={2}
            className="min-h-[4.5rem] resize-none px-3 py-2 text-sm"
            value={form.metaDescription ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, metaDescription: e.target.value || null }))
            }
          />
        </Field>
      </div>

      <div className="flex justify-end pt-0.5">
        <Button
          type="submit"
          className="h-10 px-5"
          disabled={save.isPending || !!uploading}
        >
          {save.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function AssetUploader({
  label,
  url,
  uploading,
  inputRef,
  onPick,
  onClear,
  onFile,
}: {
  label: string;
  url?: string | null;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPick: () => void;
  onClear: () => void;
  onFile: (file: File | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-border bg-muted/20 px-2.5 py-2">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={label} className="size-full object-contain" />
          ) : (
            <ImagePlus className="size-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs"
            onClick={onPick}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" /> : "آپلود"}
          </Button>
          {url ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={onClear}
              disabled={uploading}
            >
              <Trash2 className="size-3.5" />
              حذف
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/x-icon,.ico"
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
