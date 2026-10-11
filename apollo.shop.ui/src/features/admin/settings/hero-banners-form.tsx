"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import {
  SHOP_SETTINGS_QUERY_KEY,
  uploadShopAsset,
} from "@/lib/shop-settings-api";
import type { HeroBanner, ShopSettings } from "@/types/api";

type BannerDraft = {
  id: string;
  imageUrl: string;
  linkUrl: string;
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `banner-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function HeroBannersForm() {
  const queryClient = useQueryClient();
  const [banners, setBanners] = useState<BannerDraft[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetId = useRef<string | null>(null);

  const settings = useQuery({
    queryKey: SHOP_SETTINGS_QUERY_KEY,
    queryFn: async () => (await api.get<ShopSettings>("/api/shop-settings")).data,
  });

  useEffect(() => {
    if (!settings.data) return;
    setBanners(
      (settings.data.heroBanners ?? []).map((b: HeroBanner) => ({
        id: b.id || newId(),
        imageUrl: b.imageUrl,
        linkUrl: b.linkUrl ?? "",
      })),
    );
  }, [settings.data]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        banners: banners
          .filter((b) => b.imageUrl.trim())
          .map((b, index) => ({
            id: b.id,
            imageUrl: b.imageUrl.trim(),
            linkUrl: b.linkUrl.trim() || null,
            sortOrder: index,
          })),
      };
      const { data } = await api.put<ShopSettings>(
        "/api/admin/shop-settings/hero-banners",
        payload,
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SHOP_SETTINGS_QUERY_KEY, data);
      void queryClient.invalidateQueries({ queryKey: SHOP_SETTINGS_QUERY_KEY });
      toast.success("بنرهای هیرو ذخیره شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  async function onUpload(file: File | undefined, bannerId: string) {
    if (!file) return;
    setUploadingId(bannerId);
    try {
      const result = await uploadShopAsset(file, "hero");
      setBanners((prev) =>
        prev.map((b) => (b.id === bannerId ? { ...b, imageUrl: result.url } : b)),
      );
      toast.success("تصویر بنر آپلود شد");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "آپلود ناموفق بود"));
    } finally {
      setUploadingId(null);
      uploadTargetId.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function addBanner() {
    setBanners((prev) => [...prev, { id: newId(), imageUrl: "", linkUrl: "" }]);
  }

  function removeBanner(id: string) {
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }

  if (settings.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
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
      className="space-y-4"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        save.mutate();
      }}
    >
      <p className="text-xs text-muted-foreground">
        بنرهای اسلایدر صفحهٔ اصلی. اگر هیچ تصویری نباشد، هیرو سکشن در سایت نمایش داده نمی‌شود.
        تصویر کل عرض بنر را پر می‌کند؛ سایز پیشنهادی ۱۹۲۰×۳۳۰ (عریض). محتوای مهم را وسط کادر بگذارید.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const id = uploadTargetId.current;
          if (!id) return;
          void onUpload(e.target.files?.[0], id);
        }}
      />

      <div className="space-y-3">
        {banners.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            هنوز بنری اضافه نشده است.
          </div>
        ) : (
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className="rounded-xl border border-border bg-card p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">بنر {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeBanner(banner.id)}
                >
                  <Trash2 className="size-4" />
                  حذف
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                <button
                  type="button"
                  disabled={uploadingId === banner.id}
                  onClick={() => {
                    uploadTargetId.current = banner.id;
                    fileInputRef.current?.click();
                  }}
                  className="relative flex aspect-[2.4/1] w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40 sm:aspect-auto sm:h-28"
                >
                  {banner.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={banner.imageUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="inline-flex flex-col items-center gap-1 text-xs text-muted-foreground">
                      <ImagePlus className="size-5" />
                      آپلود تصویر
                    </span>
                  )}
                  {uploadingId === banner.id ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-background/70">
                      <Loader2 className="size-5 animate-spin" />
                    </span>
                  ) : null}
                </button>

                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`banner-link-${banner.id}`} className="text-xs">
                      لینک (اختیاری)
                    </Label>
                    <Input
                      id={`banner-link-${banner.id}`}
                      className="h-9 text-sm"
                      dir="ltr"
                      placeholder="/products یا https://..."
                      value={banner.linkUrl}
                      onChange={(e) =>
                        setBanners((prev) =>
                          prev.map((b) =>
                            b.id === banner.id
                              ? { ...b, linkUrl: e.target.value }
                              : b,
                          ),
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingId === banner.id}
                    onClick={() => {
                      uploadTargetId.current = banner.id;
                      fileInputRef.current?.click();
                    }}
                  >
                    {banner.imageUrl ? "تعویض تصویر" : "انتخاب تصویر"}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" onClick={addBanner}>
          <Plus className="size-4" />
          افزودن بنر
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            "ذخیره بنرها"
          )}
        </Button>
      </div>
    </form>
  );
}
