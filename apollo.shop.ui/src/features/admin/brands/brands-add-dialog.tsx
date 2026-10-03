"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Upload, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingField } from "@/components/ui/floating-field";
import { getApiErrorMessage } from "@/lib/api";
import { uploadShopAsset } from "@/lib/shop-settings-api";
import { cn } from "@/lib/utils";
import type { UpsertBrandRequest } from "@/types/api";

type BrandsAddDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: UpsertBrandRequest) => Promise<void> | void;
  submitting?: boolean;
};

function slugFromName(name: string) {
  return name.trim().replace(/\s+/g, "-");
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  imagePath: "",
};

const surface = "bg-popover";

export function BrandsAddDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
}: BrandsAddDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setError(null);
    setUploading(false);
  }, [open]);

  const uploadImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadShopAsset(file, "shop");
      setForm((f) => ({ ...f, imagePath: result.url }));
      toast.success("تصویر آپلود شد");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "آپلود ناموفق بود"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("نام برند الزامی است.");
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      slug: form.slug.trim() || slugFromName(form.name),
      description: form.description.trim() || null,
      imagePath: form.imagePath.trim() || null,
      isActive: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <div className="flex items-center justify-between gap-3">
          <DialogTitle className="leading-none">افزودن برند</DialogTitle>
          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
              />
            }
          >
            <XIcon className="size-4" />
            <span className="sr-only">بستن</span>
          </DialogClose>
        </div>

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <FloatingField
            label="نام"
            required
            surfaceClassName={surface}
            value={form.name}
            onChange={(value) => setForm((f) => ({ ...f, name: value }))}
          />
          <FloatingField
            label="اسلاگ"
            surfaceClassName={surface}
            dir="ltr"
            value={form.slug}
            onChange={(value) =>
              setForm((f) => ({
                ...f,
                slug: value.replace(/\s+/g, "-"),
              }))
            }
          />
          <FloatingField
            label="توضیحات"
            className="sm:col-span-2"
            surfaceClassName={surface}
            value={form.description}
            onChange={(value) =>
              setForm((f) => ({ ...f, description: value }))
            }
          />

          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 transition",
                "hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                uploading && "opacity-70",
              )}
              aria-label="آپلود تصویر برند"
            >
              {form.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.imagePath}
                  alt=""
                  className="size-full object-cover"
                />
              ) : uploading ? (
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="size-5 text-muted-foreground" />
              )}
            </button>
            <div className="min-w-0 space-y-1.5">
              <p className="text-sm font-medium">تصویر برند</p>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  {form.imagePath ? "تغییر تصویر" : "آپلود تصویر"}
                </Button>
                {form.imagePath ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs"
                    disabled={uploading}
                    onClick={() => setForm((f) => ({ ...f, imagePath: "" }))}
                  >
                    حذف
                  </Button>
                ) : null}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              className="hidden"
              onChange={(e) => {
                void uploadImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive sm:col-span-2">{error}</p>
          ) : null}

          <DialogFooter className="gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg px-5"
              onClick={() => onOpenChange(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-lg px-5"
              disabled={submitting || uploading}
            >
              {submitting ? "در حال ایجاد..." : "ایجاد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
