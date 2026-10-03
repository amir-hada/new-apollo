"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { XIcon } from "lucide-react";
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
import { normalizeDigits, formatGroupedPersianDigits } from "@/features/auth/normalize-phone";
import type { CategoryRow } from "@/features/admin/categories/data";
import { priceToPersianWords } from "@/lib/persian-number-words";
import { useShopCurrency } from "@/providers/ShopCurrencyProvider";
import type { Brand, CreateProductRequest } from "@/types/api";

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
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setError(null);
  }, [open]);

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
      images: [],
      specs: [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <div className="flex items-center justify-between gap-3">
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

        <form className="grid gap-4" onSubmit={handleSubmit}>
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

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <DialogFooter className="gap-2">
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
              disabled={submitting}
            >
              {submitting ? "در حال ایجاد..." : "ایجاد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
