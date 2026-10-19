"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ImagePlus, Loader2, Trash2, XIcon } from "lucide-react";
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
import { FloatingSelect } from "@/components/ui/floating-select";
import { ProductSpecsEditor } from "@/features/admin/products/product-specs-editor";
import { normalizeDigits, formatGroupedPersianDigits, toPersianDigits } from "@/features/auth/normalize-phone";
import type { CategoryRow } from "@/features/admin/categories/data";
import { getApiErrorMessage } from "@/lib/api";
import { priceToPersianWords } from "@/lib/persian-number-words";
import { resolveProductImageUrl } from "@/lib/product-image";
import { uploadShopAsset } from "@/lib/shop-settings-api";
import { cn } from "@/lib/utils";
import { useShopCurrency } from "@/providers/ShopCurrencyProvider";
import type {
  Brand,
  CreateProductRequest,
  ProductImage,
  ProductSpec,
} from "@/types/api";

export type CreateProductPayload = CreateProductRequest;

type ProductsAddDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryRow[];
  brands: Brand[];
  onSubmit: (payload: CreateProductPayload) => Promise<void> | void;
  submitting?: boolean;
};

function slugFromName(name: string) {
  return name.trim().replace(/\s+/g, "-");
}

function normalizeImages(images: ProductImage[]): ProductImage[] {
  return images.map((img, index) => ({
    ...img,
    sortOrder: index,
    isPrimary: index === 0,
  }));
}

const emptyForm = {
  name: "",
  categoryId: "none",
  brandId: "none",
  description: "",
  basePrice: "",
};

const surface = "bg-popover";

export function ProductsAddDialog({
  open,
  onOpenChange,
  categories,
  brands,
  onSubmit,
  submitting = false,
}: ProductsAddDialogProps) {
  const shopCurrency = useShopCurrency();
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(emptyForm);
  const [specs, setSpecs] = useState<ProductSpec[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setSpecs([]);
    setImages([]);
    setUploadingPrimary(false);
    setUploadingGallery(false);
    setError(null);
  }, [open]);

  const primaryImage = images.find((img) => img.isPrimary) ?? images[0] ?? null;
  const galleryImages = images.filter((img) => !img.isPrimary);

  const uploadPrimaryImage = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("فقط فایل تصویری مجاز است");
      return;
    }
    setUploadingPrimary(true);
    try {
      const result = await uploadShopAsset(file, "shop");
      setImages((prev) => {
        const gallery = prev.filter((img) => !img.isPrimary);
        return normalizeImages([
          {
            id: null,
            imagePath: result.url,
            alternativeText: form.name.trim() || null,
            sortOrder: 0,
            isPrimary: true,
            mediaKind: 0,
          },
          ...gallery,
        ]);
      });
      toast.success("تصویر اصلی آپلود شد");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "آپلود تصویر ناموفق بود"));
    } finally {
      setUploadingPrimary(false);
    }
  };

  const uploadGalleryImages = async (files: FileList | File[] | undefined) => {
    if (!files) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploadingGallery(true);
    try {
      const uploaded: ProductImage[] = [];
      for (const file of list) {
        if (!file.type.startsWith("image/")) {
          toast.error(`فایل «${file.name}» تصویر نیست`);
          continue;
        }
        const result = await uploadShopAsset(file, "shop");
        uploaded.push({
          id: null,
          imagePath: result.url,
          alternativeText: form.name.trim() || null,
          sortOrder: 0,
          isPrimary: false,
          mediaKind: 0,
        });
      }
      if (uploaded.length === 0) return;
      setImages((prev) => normalizeImages([...prev, ...uploaded]));
      toast.success(
        uploaded.length === 1
          ? "تصویر به گالری اضافه شد"
          : `${toPersianDigits(String(uploaded.length))} تصویر به گالری اضافه شد`,
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, "آپلود گالری ناموفق بود"));
    } finally {
      setUploadingGallery(false);
    }
  };

  const removePrimaryImage = () => {
    setImages((prev) => normalizeImages(prev.filter((img) => !img.isPrimary)));
  };

  const removeGalleryAt = (index: number) => {
    setImages((prev) => {
      const gallery = prev.filter((img) => !img.isPrimary);
      const nextGallery = gallery.filter((_, i) => i !== index);
      const primary = prev.filter((img) => img.isPrimary);
      return normalizeImages([...primary, ...nextGallery]);
    });
  };

  const categoryOptions = useMemo(
    () => [
      { value: "none", label: "بدون دسته‌بندی" },
      ...categories.map((category) => ({
        value: category.id,
        label: `${"—".repeat(category.depth)} ${category.name}`.trim(),
      })),
    ],
    [categories],
  );

  const brandOptions = useMemo(
    () => [
      { value: "none", label: "بدون برند" },
      ...brands
        .filter((b) => b.isActive)
        .map((b) => ({ value: b.id, label: b.name })),
    ],
    [brands],
  );

  const hasCategories = categories.length > 0;
  const hasBrands = brands.some((b) => b.isActive);

  const priceNumber = useMemo(() => {
    const digits = normalizeDigits(form.basePrice);
    if (!digits) return null;
    const n = Number(digits);
    return Number.isFinite(n) ? n : null;
  }, [form.basePrice]);

  const priceWords =
    priceNumber != null && priceNumber >= 0
      ? priceToPersianWords(priceNumber, shopCurrency)
      : "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("نام محصول الزامی است.");
      return;
    }

    if (priceNumber == null) {
      setError("قیمت اصلی الزامی است.");
      return;
    }

    if (priceNumber <= 0) {
      setError("قیمت اصلی باید بیشتر از صفر باشد.");
      return;
    }

    const name = form.name.trim();
    const description = form.description.trim() || name;

    const cleanedSpecs = specs
      .map((s, index) => ({
        id: s.id,
        name: s.name.trim(),
        isOrderParameter:
          s.isOrderParameter && s.values.filter((v) => v.value.trim()).length >= 2,
        sortOrder: index + 1,
        values: s.values
          .filter((v) => v.value.trim())
          .map((v, vi) => ({
            id: v.id,
            value: v.value.trim(),
            priceAdjustment:
              s.isOrderParameter &&
              s.values.filter((x) => x.value.trim()).length >= 2
                ? v.priceAdjustment || 0
                : 0,
            sortOrder: vi + 1,
            colorHex: v.colorHex?.trim() || null,
          })),
      }))
      .filter((s) => s.name && s.values.length > 0);

    const payloadImages = normalizeImages(images).map((img) => ({
      ...img,
      alternativeText: img.alternativeText || name,
    }));

    await onSubmit({
      name,
      slug: slugFromName(name),
      description,
      brandId: form.brandId === "none" ? null : form.brandId,
      categoryId: form.categoryId === "none" ? null : form.categoryId,
      isAvailable: false,
      status: 0,
      basePrice: priceNumber,
      discountPrice: null,
      stockQuantity: 0,
      trackInventory: false,
      showStockInStore: false,
      stockDisplayThreshold: null,
      minOrderQuantity: 1,
      maxOrderQuantity: null,
      seoTitle: null,
      seoDescription: null,
      seoKeywords: null,
      focusKeyword: null,
      canonicalUrl: null,
      robotsNoIndex: false,
      robotsNoFollow: false,
      ogTitle: null,
      ogDescription: null,
      ogImageUrl: null,
      sku: null,
      images: payloadImages,
      specs: cleanedSpecs,
    });
  };

  const busy = submitting || uploadingPrimary || uploadingGallery;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[min(92vh,820px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <DialogTitle className="leading-none">افزودن محصول</DialogTitle>
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

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                تصویر اصلی
              </p>
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl ring-1 ring-inset ring-border",
                  "aspect-[16/9] max-h-44 bg-gradient-to-br from-muted/80 via-muted/40 to-background",
                  uploadingPrimary && "pointer-events-none opacity-70",
                )}
              >
                {primaryImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveProductImageUrl(primaryImage.imagePath)}
                      alt={primaryImage.alternativeText || form.name || "محصول"}
                      className="absolute inset-0 size-full object-cover"
                    />
                    <div className="absolute inset-x-0 top-0 z-10 flex justify-end gap-1.5 p-2">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="secondary"
                        className="size-8 rounded-full bg-white text-slate-900 shadow-sm hover:bg-white [&_svg]:text-slate-900"
                        onClick={() => primaryInputRef.current?.click()}
                        title="تعویض تصویر"
                      >
                        <ImagePlus className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="destructive"
                        className="size-8 rounded-full shadow-sm"
                        onClick={removePrimaryImage}
                        title="حذف تصویر"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 px-4 text-center"
                    onClick={() => primaryInputRef.current?.click()}
                  >
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-background/80 shadow-sm ring-1 ring-border">
                      {uploadingPrimary ? (
                        <Loader2 className="size-5 animate-spin text-primary" />
                      ) : (
                        <ImagePlus className="size-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm font-medium">
                      {uploadingPrimary
                        ? "در حال آپلود..."
                        : "افزودن تصویر اصلی"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      PNG، JPG یا WEBP
                    </p>
                  </button>
                )}
                <input
                  ref={primaryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => {
                    void uploadPrimaryImage(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  گالری تصاویر
                </p>
                <span className="text-[11px] text-muted-foreground">
                  {toPersianDigits(String(galleryImages.length))} تصویر
                </span>
              </div>

              {galleryImages.length > 0 ? (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {galleryImages.map((item, index) => (
                    <li
                      key={`${item.imagePath}-${index}`}
                      className="relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveProductImageUrl(item.imagePath)}
                        alt=""
                        className="size-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="destructive"
                        className="absolute end-1.5 top-1.5 size-7 rounded-full shadow-sm"
                        onClick={() => removeGalleryAt(index)}
                        title="حذف"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}

              <button
                type="button"
                disabled={busy}
                onClick={() => galleryInputRef.current?.click()}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-3 py-3 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground",
                  uploadingGallery && "opacity-70",
                )}
              >
                {uploadingGallery ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ImagePlus className="size-4" />
                )}
                {uploadingGallery
                  ? "در حال آپلود گالری..."
                  : "افزودن چند تصویر به گالری"}
              </button>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={busy}
                onChange={(e) => {
                  void uploadGalleryImages(e.target.files ?? undefined);
                  e.target.value = "";
                }}
              />
            </div>

            <FloatingField
              label="نام"
              required
              surfaceClassName={surface}
              value={form.name}
              onChange={(value) => setForm((f) => ({ ...f, name: value }))}
            />

            <FloatingSelect
              label="دسته‌بندی"
              emptyValue="none"
              surfaceClassName={surface}
              value={form.categoryId}
              onChange={(value) =>
                setForm((f) => ({ ...f, categoryId: value }))
              }
              options={
                hasCategories
                  ? categoryOptions
                  : [{ value: "none", label: "بدون دسته‌بندی" }]
              }
              inactive={!hasCategories}
              searchPlaceholder="جستجو ..."
              onInactiveClick={() =>
                toast.error("در حال حاضر هیچ دسته بندی وجود ندارد", {
                  id: "product-category-empty",
                })
              }
            />

            <FloatingSelect
              label="برند"
              emptyValue="none"
              surfaceClassName={surface}
              value={form.brandId}
              onChange={(value) => setForm((f) => ({ ...f, brandId: value }))}
              options={
                hasBrands
                  ? brandOptions
                  : [{ value: "none", label: "بدون برند" }]
              }
              inactive={!hasBrands}
              searchPlaceholder="جستجو ..."
              onInactiveClick={() =>
                toast.error("در حال حاضر هیچ برندی وجود ندارد", {
                  id: "product-brand-empty",
                })
              }
            />

            <FloatingField
              label="توضیحات"
              surfaceClassName={surface}
              value={form.description}
              onChange={(value) =>
                setForm((f) => ({ ...f, description: value }))
              }
            />

            <div className="space-y-1.5">
              <FloatingField
                label="قیمت اصلی"
                required
                dir="ltr"
                surfaceClassName={surface}
                value={formatGroupedPersianDigits(form.basePrice)}
                onChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    basePrice: normalizeDigits(value),
                  }))
                }
              />
              {priceWords ? (
                <p className="px-1 text-xs font-light text-muted-foreground">
                  {priceWords}
                </p>
              ) : null}
            </div>

            <div className="space-y-2 border-t border-border pt-3">
              <ProductSpecsEditor specs={specs} onChange={setSpecs} compact />
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <DialogFooter className="!mx-0 !mb-0 shrink-0 gap-2 rounded-none border-t border-border bg-transparent px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
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
              disabled={busy}
            >
              {submitting ? "در حال ایجاد..." : "ایجاد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
