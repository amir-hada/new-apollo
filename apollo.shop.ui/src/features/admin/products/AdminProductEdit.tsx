"use client";

import { type DragEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CircleDollarSign,
  FileText,
  GripVertical,
  ImagePlus,
  Images,
  ListChecks,
  Loader2,
  NotebookPen,
  Plus,
  Settings2,
  Star,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { ProductRichTextEditor } from "@/components/editor/product-rich-text-editor";
import { ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { FloatingField } from "@/components/ui/floating-field";
import { FloatingSelect } from "@/components/ui/floating-select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { flattenCategories } from "@/features/admin/categories/data";
import { ProductReportsPanel } from "@/features/admin/products/product-reports-panel";
import { ProductSpecsEditor } from "@/features/admin/products/product-specs-editor";
import { normalizeDigits, toPersianDigits, formatGroupedPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { priceToPersianWords } from "@/lib/persian-number-words";
import { uploadShopAsset } from "@/lib/shop-settings-api";
import { cn } from "@/lib/utils";
import { useShopCurrency } from "@/providers/ShopCurrencyProvider";
import type {
  Brand,
  CategoryTree,
  ProductDetail,
  ProductImage,
  ProductMediaKind,
  ProductSpec,
  UpdateProductRequest,
} from "@/types/api";

function slugFromName(name: string) {
  return name.trim().replace(/\s+/g, "-");
}

function slugSanitize(value: string) {
  return value.replace(/\s+/g, "-");
}

/** اگر اسلاگ خالی/فقط خط‌تیره باشد، از نام با جایگزینی فاصله به «-» ساخته می‌شود. */
function resolveProductSlug(slug: string, name: string) {
  const trimmed = slug.trim();
  if (!trimmed || /^[-_]+$/.test(trimmed)) {
    return slugFromName(name);
  }
  return trimmed;
}

function isVideoFile(file: File) {
  return file.type.startsWith("video/");
}

function isVideoPath(path: string, mediaKind?: ProductMediaKind) {
  if (mediaKind === 1) return true;
  return /\.(mp4|webm|mov)(\?|$)/i.test(path);
}

type FormState = {
  name: string;
  slug: string;
  description: string;
  brandId: string;
  categoryId: string;
  isAvailable: boolean;
  status: string;
  productCode: string;
  sku: string;
  basePrice: string;
  discountPrice: string;
  stockQuantity: string;
  trackInventory: boolean;
  showStockInStore: boolean;
  stockDisplayThreshold: string;
  minOrderQuantity: string;
  maxOrderQuantity: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  focusKeyword: string;
  canonicalUrl: string;
  robotsNoIndex: boolean;
  robotsNoFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  images: ProductImage[];
  specs: ProductSpec[];
};

const statusOptions = [
  { value: "0", label: "پیش‌نویس" },
  { value: "1", label: "منتشرشده" },
  { value: "2", label: "آرشیو" },
];

const productTabTriggerClass =
  "h-9 touch-manipulation gap-1 px-2.5 py-1.5 text-[12px] font-normal tracking-wide text-muted-foreground/75 data-active:font-medium data-active:text-primary sm:text-[12.5px] [&_svg]:size-3.5 [&_svg]:stroke-[1.4] data-active:[&_svg]:stroke-[1.7] max-md:shrink-0 max-md:flex-none md:min-w-0 md:flex-1";

function SwitchField({
  label,
  description,
  hint,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 px-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
        disabled && "opacity-70",
      )}
    >
      <div className="flex min-w-0 items-start gap-1.5">
        <div className="min-w-0">
          <Label
            className={cn(
              "text-sm",
              disabled && "text-muted-foreground",
            )}
          >
            {label}
          </Label>
          {description ? (
            <p className="text-xs text-pretty text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {hint ? <InventoryHint text={hint} /> : null}
      </div>
      <Switch
        className="self-end sm:self-auto"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function InventoryHint({ text }: { text: string }) {
  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className={cn(
            "mt-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded-full",
            "text-muted-foreground/75 transition-colors hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          )}
          aria-label="راهنما"
          onClick={(e) => e.preventDefault()}
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden>
            <circle
              cx="8"
              cy="8"
              r="6.25"
              stroke="currentColor"
              strokeWidth="1.35"
            />
            <path
              d="M6.35 6.15c0-1.05.8-1.8 1.85-1.8s1.85.72 1.85 1.7c0 .78-.4 1.2-1.05 1.58-.58.34-.8.58-.8 1.12v.25"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8" cy="11.35" r="0.85" fill="currentColor" />
          </svg>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-[17rem] px-3 py-2 text-start text-[11px] leading-5 font-normal"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function parseOptionalNumber(value: string): number | null {
  const digits = normalizeDigits(value.trim());
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

function normalizeImages(images: ProductImage[]): ProductImage[] {
  return images.map((img, index) => ({
    ...img,
    mediaKind: (img.mediaKind ?? 0) as ProductMediaKind,
    sortOrder: index,
    isPrimary: Boolean(img.isPrimary),
  }));
}

function productToForm(p: ProductDetail): FormState {
  return {
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    brandId: p.brandId ?? "none",
    categoryId: p.categoryId ?? "none",
    isAvailable: p.isAvailable,
    status: String(p.status),
    productCode: p.productCode,
    sku: p.sku ?? "",
    basePrice: p.basePrice > 0 ? String(p.basePrice) : "",
    discountPrice: p.discountPrice != null ? String(p.discountPrice) : "",
    stockQuantity: String(p.stockQuantity ?? 0),
    trackInventory: p.trackInventory,
    showStockInStore: p.showStockInStore,
    stockDisplayThreshold:
      p.stockDisplayThreshold != null ? String(p.stockDisplayThreshold) : "",
    minOrderQuantity: String(p.minOrderQuantity ?? 1),
    maxOrderQuantity:
      p.maxOrderQuantity != null ? String(p.maxOrderQuantity) : "",
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    seoKeywords: p.seoKeywords ?? "",
    focusKeyword: p.focusKeyword ?? "",
    canonicalUrl: p.canonicalUrl ?? "",
    robotsNoIndex: Boolean(p.robotsNoIndex),
    robotsNoFollow: Boolean(p.robotsNoFollow),
    ogTitle: p.ogTitle ?? "",
    ogDescription: p.ogDescription ?? "",
    ogImageUrl: p.ogImageUrl ?? "",
    images: normalizeImages(
      (p.images ?? []).map((img) => ({
        ...img,
        mediaKind: (img.mediaKind ?? 0) as ProductMediaKind,
      })),
    ),
    specs: (p.specs ?? []).map((s, index) => ({
      id: s.id,
      name: s.name,
      isOrderParameter: Boolean(s.isOrderParameter),
      sortOrder: s.sortOrder ?? index + 1,
      values:
        s.values?.length > 0
          ? s.values.map((v, vi) => ({
              id: v.id,
              value: v.value,
              priceAdjustment: v.priceAdjustment ?? 0,
              sortOrder: v.sortOrder ?? vi + 1,
            }))
          : [
              {
                id: null,
                value: "",
                priceAdjustment: 0,
                sortOrder: 1,
              },
            ],
    })),
  };
}

export function AdminProductEdit() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const queryClient = useQueryClient();
  const shopCurrency = useShopCurrency();
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [tab, setTab] = useState("basic");
  const [primaryDragOver, setPrimaryDragOver] = useState(false);
  const [galleryDragOver, setGalleryDragOver] = useState(false);
  const [galleryReorderFrom, setGalleryReorderFrom] = useState<number | null>(
    null,
  );
  const [galleryReorderOver, setGalleryReorderOver] = useState<number | null>(
    null,
  );
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const hydratedProductId = useRef<string | null>(null);

  const product = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () =>
      (await api.get<ProductDetail>(`/api/admin/products/${id}`)).data,
    enabled: Boolean(id),
  });

  const brands = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () =>
      (await api.get<Brand[]>("/api/admin/brands")).data,
  });

  const tree = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () =>
      (await api.get<CategoryTree[]>("/api/admin/categories/tree")).data,
  });

  const brandOptions = useMemo(
    () => [
      { value: "none", label: "بدون برند" },
      ...(brands.data ?? []).map((b) => ({ value: b.id, label: b.name })),
    ],
    [brands.data],
  );

  const categoryOptions = useMemo(() => {
    const flat = flattenCategories(tree.data ?? []);
    return [
      { value: "none", label: "بدون دسته" },
      ...flat.map((c) => ({
        value: c.id,
        label: c.depth > 0 ? `${"— ".repeat(c.depth)}${c.name}` : c.name,
      })),
    ];
  }, [tree.data]);

  useEffect(() => {
    hydratedProductId.current = null;
    setForm(null);
  }, [id]);

  useEffect(() => {
    const p = product.data;
    if (!p) return;
    // Only hydrate once per product load so refetches don't overwrite in-progress edits
    // (e.g. cleared SKU snapping back to the previous value).
    if (hydratedProductId.current === p.id) return;
    hydratedProductId.current = p.id;
    setForm(productToForm(p));
    setError(null);
  }, [product.data]);

  const priceNumber = useMemo(() => {
    if (!form) return null;
    return parseOptionalNumber(form.basePrice);
  }, [form]);

  const discountNumber = useMemo(() => {
    if (!form) return null;
    return parseOptionalNumber(form.discountPrice);
  }, [form]);

  const priceWords =
    priceNumber != null && priceNumber > 0
      ? priceToPersianWords(priceNumber, shopCurrency)
      : "";

  const discountWords =
    discountNumber != null && discountNumber > 0
      ? priceToPersianWords(discountNumber, shopCurrency)
      : "";

  const discountPercent =
    priceNumber != null &&
    priceNumber > 0 &&
    discountNumber != null &&
    discountNumber > 0 &&
    discountNumber < priceNumber
      ? Math.round(((priceNumber - discountNumber) / priceNumber) * 100)
      : null;

  const uploading = uploadingPrimary || uploadingGallery;

  const save = useMutation({
    mutationFn: async (payload: UpdateProductRequest) =>
      (await api.put<ProductDetail>(`/api/admin/products/${id}`, payload))
        .data,
    onSuccess: (data) => {
      queryClient.setQueryData(["admin-product", id], data);
      hydratedProductId.current = data.id;
      setForm(productToForm(data));
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("تغییرات ذخیره شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const buildPayload = (): UpdateProductRequest | null => {
    if (!form) return null;
    if (!form.name.trim()) {
      setError("نام محصول الزامی است");
      setTab("basic");
      return null;
    }
    const basePrice = parseOptionalNumber(form.basePrice);
    if (basePrice == null || basePrice <= 0) {
      setError("قیمت اصلی الزامی است و باید بیشتر از صفر باشد");
      setTab("pricing");
      return null;
    }
    const discountPrice = parseOptionalNumber(form.discountPrice);
    if (discountPrice != null) {
      if (discountPrice <= 0) {
        setError("قیمت با تخفیف باید بیشتر از صفر باشد");
        setTab("pricing");
        return null;
      }
      if (discountPrice >= basePrice) {
        setError("قیمت با تخفیف باید کمتر از قیمت اصلی باشد");
        setTab("pricing");
        return null;
      }
    }
    const trackInventory = form.trackInventory;
    const stockQuantity = trackInventory
      ? (parseOptionalNumber(form.stockQuantity) ?? 0)
      : 0;
    if (trackInventory && stockQuantity < 0) {
      setError("موجودی کل نمی‌تواند منفی باشد");
      setTab("inventory");
      return null;
    }
    const minOrderQuantity = trackInventory
      ? Math.max(1, parseOptionalNumber(form.minOrderQuantity) ?? 1)
      : 1;
    const maxOrderQuantity = trackInventory
      ? parseOptionalNumber(form.maxOrderQuantity)
      : null;
    if (
      trackInventory &&
      maxOrderQuantity != null &&
      maxOrderQuantity < minOrderQuantity
    ) {
      setError("حداکثر سفارش باید بزرگ‌تر یا مساوی حداقل سفارش باشد");
      setTab("inventory");
      return null;
    }
    const showStockInStore = trackInventory && form.showStockInStore;
    const stockDisplayThreshold = showStockInStore
      ? parseOptionalNumber(form.stockDisplayThreshold)
      : null;
    if (
      showStockInStore &&
      stockDisplayThreshold != null &&
      stockDisplayThreshold < 0
    ) {
      setError("آستانه نمایش موجودی معتبر نیست");
      setTab("inventory");
      return null;
    }

    return {
      name: form.name.trim(),
      slug: resolveProductSlug(form.slug, form.name),
      description: form.description,
      brandId: form.brandId === "none" ? null : form.brandId,
      categoryId: form.categoryId === "none" ? null : form.categoryId,
      isAvailable: form.isAvailable,
      status: Number(form.status) as 0 | 1 | 2,
      basePrice,
      discountPrice,
      stockQuantity,
      trackInventory,
      showStockInStore,
      stockDisplayThreshold,
      minOrderQuantity,
      maxOrderQuantity,
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
      seoKeywords: form.seoKeywords.trim() || null,
      focusKeyword: form.focusKeyword.trim() || null,
      canonicalUrl: form.canonicalUrl.trim() || null,
      robotsNoIndex: form.robotsNoIndex,
      robotsNoFollow: form.robotsNoFollow,
      ogTitle: form.ogTitle.trim() || null,
      ogDescription: form.ogDescription.trim() || null,
      ogImageUrl: form.ogImageUrl.trim() || null,
      sku: form.sku.trim() || null,
      images: normalizeImages(form.images).map((img, index) => ({
        ...img,
        sortOrder: index,
        mediaKind: (img.mediaKind ?? 0) as ProductMediaKind,
      })),
      specs: form.specs
        .map((s, index) => ({
          id: s.id,
          name: s.name.trim(),
          isOrderParameter: s.isOrderParameter && s.values.filter((v) => v.value.trim()).length >= 2,
          sortOrder: index + 1,
          values: s.values
            .filter((v) => v.value.trim())
            .map((v, vi) => ({
              id: v.id,
              value: v.value.trim(),
              priceAdjustment:
                s.isOrderParameter && s.values.filter((x) => x.value.trim()).length >= 2
                  ? v.priceAdjustment || 0
                  : 0,
              sortOrder: vi + 1,
            })),
        }))
        .filter((s) => s.name && s.values.length > 0),
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = buildPayload();
    if (!payload) return;
    // اگر اسلاگ پاک شده بود، فیلد را با مقدار ساخته‌شده از نام هم‌زمان کن
    if (form && form.slug.trim() !== payload.slug) {
      setForm((f) => (f ? { ...f, slug: payload.slug } : f));
    }
    await save.mutateAsync(payload);
  };

  const uploadPrimary = async (file: File | undefined) => {
    if (!file || !form) return;
    if (!file.type.startsWith("image/")) {
      toast.error("تصویر اصلی فقط می‌تواند عکس باشد");
      return;
    }
    setUploadingPrimary(true);
    try {
      const result = await uploadShopAsset(file, "shop");
      setForm((f) => {
        if (!f) return f;
        const gallery = f.images.filter((img) => !img.isPrimary);
        return {
          ...f,
          images: normalizeImages([
            {
              id: null,
              imagePath: result.url,
              alternativeText: f.name,
              sortOrder: 0,
              isPrimary: true,
              mediaKind: 0,
            },
            ...gallery,
          ]),
        };
      });
      toast.success("تصویر اصلی آپلود شد");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "آپلود ناموفق بود"));
    } finally {
      setUploadingPrimary(false);
    }
  };

  const uploadGallery = async (files: FileList | File[] | undefined) => {
    if (!files || !form) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploadingGallery(true);
    try {
      const uploaded: ProductImage[] = [];
      for (const file of list) {
        const video = isVideoFile(file);
        if (!file.type.startsWith("image/") && !video) {
          toast.error(`فایل «${file.name}» مجاز نیست`);
          continue;
        }
        const result = await uploadShopAsset(file, "shop");
        uploaded.push({
          id: null,
          imagePath: result.url,
          alternativeText: form.name,
          sortOrder: 0,
          isPrimary: false,
          mediaKind: video ? 1 : 0,
        });
      }
      if (uploaded.length === 0) return;
      setForm((f) => {
        if (!f) return f;
        return {
          ...f,
          images: normalizeImages([...f.images, ...uploaded]),
        };
      });
      toast.success(
        uploaded.length === 1
          ? "آیتم گالری آپلود شد"
          : `${toPersianDigits(String(uploaded.length))} آیتم به گالری اضافه شد`,
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err, "آپلود ناموفق بود"));
    } finally {
      setUploadingGallery(false);
    }
  };

  const onDropPrimary = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setPrimaryDragOver(false);
    if (e.dataTransfer.files?.length) {
      void uploadPrimary(e.dataTransfer.files[0]);
    }
  };

  const onDropGalleryFiles = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setGalleryDragOver(false);
    if (galleryReorderFrom != null) return;
    if (e.dataTransfer.files?.length) {
      void uploadGallery(e.dataTransfer.files);
    }
  };

  const removeImageAt = (index: number) => {
    setForm((f) => {
      if (!f) return f;
      return {
        ...f,
        images: normalizeImages(f.images.filter((_, i) => i !== index)),
      };
    });
  };

  const removePrimaryImage = () => {
    setForm((f) => {
      if (!f) return f;
      return {
        ...f,
        images: normalizeImages(f.images.filter((img) => !img.isPrimary)),
      };
    });
  };

  const reorderGallery = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setForm((f) => {
      if (!f) return f;
      const primary = f.images.filter((img) => img.isPrimary);
      const gallery = f.images.filter((img) => !img.isPrimary);
      if (from >= gallery.length || to >= gallery.length) return f;
      const next = [...gallery];
      const [moved] = next.splice(from, 1);
      if (!moved) return f;
      next.splice(to, 0, moved);
      return { ...f, images: normalizeImages([...primary, ...next]) };
    });
  };

  const primaryImage =
    form?.images.find(
      (img) => img.isPrimary && !isVideoPath(img.imagePath, img.mediaKind),
    ) ??
    form?.images.find((img) => !isVideoPath(img.imagePath, img.mediaKind)) ??
    null;

  const galleryDisplay =
    form?.images.filter((img) => !img.isPrimary) ?? [];

  if (product.isLoading || !form) {
    return <Skeleton className="h-[32rem] w-full rounded-lg" />;
  }

  if (product.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(product.error)}
        onRetry={() => product.refetch()}
      />
    );
  }

  return (
    <form
      className="relative flex min-h-0 flex-1 flex-col gap-0 overflow-hidden"
      onSubmit={handleSubmit}
    >
      <div className="shrink-0 space-y-0.5 sm:space-y-1">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:text-sm"
        >
          <ArrowRight className="size-3.5 sm:size-4" />
          بازگشت به محصولات
        </Link>
        <h1 className="truncate text-base font-semibold sm:text-xl">
          {form.name || "ویرایش محصول"}
        </h1>
        <p className="truncate text-[11px] text-muted-foreground sm:text-sm">
          کد کالا: {toPersianDigits(form.productCode)}
          {form.sku.trim() ? ` · SKU: ${form.sku}` : null}
        </p>
      </div>

      {error ? <p className="shrink-0 text-sm text-destructive">{error}</p> : null}

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(String(value))}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden"
      >
        <div className="-mx-0.5 shrink-0 border-b border-border/70">
          <TabsList
            variant="line"
            className={cn(
              "h-auto w-full gap-0.5 rounded-none bg-transparent p-0 pb-px",
              "max-md:flex-nowrap max-md:justify-start max-md:overflow-x-auto max-md:overscroll-x-contain",
              "max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden",
              "max-md:snap-x max-md:snap-mandatory",
              "md:flex md:flex-nowrap md:justify-stretch md:overflow-visible",
            )}
          >
            <TabsTrigger value="basic" className={cn(productTabTriggerClass, "max-md:snap-start")}>
              <FileText data-icon="inline-start" />
              اطلاعات اولیه
            </TabsTrigger>
            <TabsTrigger value="description" className={cn(productTabTriggerClass, "max-md:snap-start")}>
              <NotebookPen data-icon="inline-start" />
              توضیحات
            </TabsTrigger>
            <TabsTrigger value="pricing" className={cn(productTabTriggerClass, "max-md:snap-start")}>
              <CircleDollarSign data-icon="inline-start" />
              قیمت‌گذاری
            </TabsTrigger>
            <TabsTrigger value="inventory" className={cn(productTabTriggerClass, "max-md:snap-start")}>
              <Boxes data-icon="inline-start" />
              موجودی
            </TabsTrigger>
            <TabsTrigger value="specs" className={cn(productTabTriggerClass, "max-md:snap-start")}>
              <ListChecks data-icon="inline-start" />
              ویژگی‌ها
            </TabsTrigger>
            <TabsTrigger value="settings" className={cn(productTabTriggerClass, "max-md:snap-start")}>
              <Settings2 data-icon="inline-start" />
              تنظیمات
            </TabsTrigger>
            <TabsTrigger value="reports" className={cn(productTabTriggerClass, "max-md:snap-start")}>
              <BarChart3 data-icon="inline-start" />
              گزارشات
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="basic"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden pt-2"
        >
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pe-0.5 pb-3 sm:pb-2">
            <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_15rem] xl:grid-cols-[minmax(0,1fr)_16rem]">
              <div className="rounded-xl border border-border/80 bg-card/40 p-2.5 sm:p-3">
                <h3 className="mb-2.5 text-[11px] font-medium text-muted-foreground">
                  اطلاعات محصول
                </h3>
                <div className="grid content-start gap-3 pt-1.5 sm:grid-cols-2">
                  <FloatingField
                    label="نام"
                    required
                    value={form.name}
                    onChange={(value) =>
                      setForm((f) => (f ? { ...f, name: value } : f))
                    }
                  />
                  <FloatingField
                    label="اسلاگ"
                    dir="ltr"
                    value={form.slug}
                    hint="همان بخشی از آدرس محصول است که در نوار مرورگر و لینک‌ها دیده می‌شود. بهتر است کوتاه، خوانا و به انگلیسی باشد. اگر خالی بماند، هنگام ذخیره از نام محصول (با جایگزینی فاصله با -) ساخته می‌شود."
                    onChange={(value) =>
                      setForm((f) =>
                        f ? { ...f, slug: slugSanitize(value) } : f,
                      )
                    }
                  />
                  <FloatingField
                    label="کد کالا"
                    dir="ltr"
                    value={form.productCode}
                    hint="این کد به‌صورت خودکار توسط سیستم ساخته می‌شود؛ برای هر محصول یکتاست و قابل ویرایش نیست."
                    onChange={() => undefined}
                    disabled
                  />
                  <FloatingField
                    label="SKU"
                    dir="ltr"
                    value={form.sku}
                    hint="شناسه اختیاری خودتان برای محصول است؛ بهتر است انگلیسی باشد. می‌توانید خالی بگذارید و خالی بماند."
                    onChange={(value) =>
                      setForm((f) => (f ? { ...f, sku: value } : f))
                    }
                  />
                  <FloatingSelect
                    label="برند"
                    emptyValue="none"
                    value={form.brandId}
                    onChange={(value) =>
                      setForm((f) => (f ? { ...f, brandId: value } : f))
                    }
                    options={brandOptions}
                    searchPlaceholder="جستجوی برند..."
                  />
                  <FloatingSelect
                    label="دسته‌بندی"
                    emptyValue="none"
                    value={form.categoryId}
                    onChange={(value) =>
                      setForm((f) => (f ? { ...f, categoryId: value } : f))
                    }
                    options={categoryOptions}
                    searchPlaceholder="جستجوی دسته..."
                  />
                  <FloatingSelect
                    label="وضعیت نمایش"
                    value={form.status}
                    onChange={(value) =>
                      setForm((f) => (f ? { ...f, status: value } : f))
                    }
                    options={statusOptions}
                  />
                  <SwitchField
                    label="موجود برای فروش"
                    description="ناموجود بودن محصول را به صورت ناموجود در فروشگاه نمایش می‌دهد"
                    checked={form.isAvailable}
                    onCheckedChange={(checked) =>
                      setForm((f) => (f ? { ...f, isAvailable: checked } : f))
                    }
                  />
                </div>
              </div>

              <aside className="order-first flex w-full min-h-0 lg:order-none">
                <div
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setPrimaryDragOver(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setPrimaryDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setPrimaryDragOver(false);
                  }}
                  onDrop={onDropPrimary}
                  className={cn(
                    "group relative mx-auto w-full max-w-sm overflow-hidden rounded-xl transition lg:mx-0 lg:max-w-none lg:h-full lg:min-h-0",
                    "aspect-[4/3] max-h-52 sm:max-h-64 lg:aspect-auto lg:max-h-none",
                    "bg-gradient-to-br from-muted/80 via-muted/40 to-background",
                    "ring-1 ring-inset ring-border",
                    primaryDragOver && "ring-2 ring-primary",
                    uploadingPrimary && "pointer-events-none opacity-70",
                  )}
                >
                  {primaryImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={primaryImage.imagePath}
                        alt={primaryImage.alternativeText ?? form.name}
                        className="absolute inset-0 size-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />

                      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[11px] text-white backdrop-blur-sm">
                          <Star className="size-3 fill-current" />
                          تصویر اصلی
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="secondary"
                            className="size-8 rounded-full bg-white text-slate-900 shadow-sm hover:bg-white hover:text-slate-900 [&_svg]:text-slate-900"
                            onClick={() => primaryInputRef.current?.click()}
                            title="تعویض تصویر"
                          >
                            <ImagePlus className="size-3.5 text-slate-900" />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="destructive"
                            className="size-8 rounded-full shadow-sm"
                            onClick={removePrimaryImage}
                            title="حذف تصویر اصلی"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-2 px-4 text-center"
                      onClick={() => primaryInputRef.current?.click()}
                    >
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-background/80 shadow-sm ring-1 ring-border">
                        {uploadingPrimary ? (
                          <Loader2 className="size-5 animate-spin text-primary" />
                        ) : (
                          <ImagePlus className="size-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {uploadingPrimary
                          ? "در حال آپلود..."
                          : "تصویر اصلی محصول"}
                      </p>
                      <p className="text-[11px] leading-4 text-muted-foreground">
                        PNG، JPG یا WEBP
                      </p>
                    </button>
                  )}
                  <input
                    ref={primaryInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingPrimary}
                    onChange={(e) => {
                      void uploadPrimary(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </div>
              </aside>
            </div>

            <div
              onDragEnter={(e) => {
                if (galleryReorderFrom != null) return;
                if (![...e.dataTransfer.types].includes("Files")) return;
                e.preventDefault();
                setGalleryDragOver(true);
              }}
              onDragOver={(e) => {
                if (galleryReorderFrom != null) return;
                if (![...e.dataTransfer.types].includes("Files")) return;
                e.preventDefault();
                setGalleryDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setGalleryDragOver(false);
              }}
              onDrop={onDropGalleryFiles}
              className={cn(
                "relative flex w-full flex-col rounded-xl transition",
                "border border-border/80 bg-card/40",
                galleryDragOver && "ring-2 ring-primary",
                uploadingGallery && "pointer-events-none opacity-70",
              )}
            >
              <div className="flex flex-col px-2.5 pt-2 pb-[10px] sm:px-3">
                <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                  <h3 className="text-[11px] font-medium text-muted-foreground">
                    گالری محصول
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    {toPersianDigits(String(galleryDisplay.length))} آیتم
                  </span>
                </div>

                {galleryDisplay.length > 0 ? (
                  <ul className="grid grid-cols-3 gap-2 sm:flex sm:items-start sm:gap-2 sm:overflow-x-auto sm:pb-0.5">
                    {galleryDisplay.map((item, localIndex) => {
                      const globalIndex = form.images.indexOf(item);
                      const video = isVideoPath(
                        item.imagePath,
                        item.mediaKind,
                      );
                      const isDragging = galleryReorderFrom === localIndex;
                      const isOver = galleryReorderOver === localIndex;
                      return (
                        <li
                          key={`${item.id ?? item.imagePath}-${localIndex}`}
                          draggable
                          onDragStart={(e) => {
                            setGalleryReorderFrom(localIndex);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData(
                              "text/gallery-index",
                              String(localIndex),
                            );
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (galleryReorderFrom == null) return;
                            setGalleryReorderOver(localIndex);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const from =
                              galleryReorderFrom ??
                              Number(
                                e.dataTransfer.getData("text/gallery-index"),
                              );
                            reorderGallery(from, localIndex);
                            setGalleryReorderFrom(null);
                            setGalleryReorderOver(null);
                          }}
                          onDragEnd={() => {
                            setGalleryReorderFrom(null);
                            setGalleryReorderOver(null);
                          }}
                          className={cn(
                            "relative aspect-square w-full cursor-grab active:cursor-grabbing sm:size-32 sm:shrink-0 sm:aspect-auto",
                            isDragging && "opacity-40",
                            isOver &&
                              galleryReorderFrom !== localIndex &&
                              "rounded-xl ring-2 ring-primary",
                          )}
                        >
                          <div className="relative size-full overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                            {video ? (
                              <div className="flex size-full flex-col items-center justify-center gap-1 bg-foreground/90 text-background">
                                <Video className="size-6" />
                                <span className="text-[11px]">ویدیو</span>
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imagePath}
                                alt=""
                                className="pointer-events-none size-full object-cover"
                              />
                            )}
                            <span className="absolute start-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-md bg-black/45 text-white backdrop-blur-sm">
                              <GripVertical className="size-3.5" />
                            </span>
                            <Button
                              type="button"
                              size="icon-sm"
                              variant="destructive"
                              className="absolute end-1.5 top-1.5 size-7 rounded-full shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImageAt(globalIndex);
                              }}
                              title="حذف"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                    <li className="relative size-28 shrink-0 sm:size-32">
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex size-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                      >
                        {uploadingGallery ? (
                          <Loader2 className="size-6 animate-spin" />
                        ) : (
                          <ImagePlus className="size-6" />
                        )}
                        <span className="text-[11px]">افزودن</span>
                      </button>
                    </li>
                  </ul>
                ) : (
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex min-h-[10rem] w-full cursor-pointer flex-col items-center justify-center gap-1.5 py-6 text-center"
                  >
                    {uploadingGallery ? (
                      <Loader2 className="size-5 animate-spin text-primary" />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-xl bg-background/80 ring-1 ring-border">
                        <Images className="size-4 text-primary" />
                      </div>
                    )}
                    <p className="text-xs font-medium">
                      {uploadingGallery
                        ? "در حال آپلود..."
                        : "عکس یا ویدیو به گالری اضافه کنید"}
                    </p>
                  </button>
                )}
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm,video/quicktime"
                multiple
                className="hidden"
                disabled={uploadingGallery}
                onChange={(e) => {
                  void uploadGallery(e.target.files ?? undefined);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="description"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden pt-1"
        >
          <ProductRichTextEditor
            className="min-h-0 flex-1"
            value={form.description}
            onChange={(html) =>
              setForm((f) => (f ? { ...f, description: html } : f))
            }
          />
        </TabsContent>

        <TabsContent
          value="pricing"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden pt-2"
        >
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pe-0.5 pb-2">
            <div className="rounded-xl border border-border/80 bg-card/40 p-2.5 sm:p-3">
              <h3 className="mb-2.5 text-[11px] font-medium text-muted-foreground">
                قیمت محصول
              </h3>
              <div className="grid content-start gap-3 pt-1.5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FloatingField
                    label="قیمت اصلی"
                    required
                    dir="ltr"
                    value={formatGroupedPersianDigits(form.basePrice)}
                    onChange={(value) =>
                      setForm((f) =>
                        f ? { ...f, basePrice: normalizeDigits(value) } : f,
                      )
                    }
                  />
                  {priceWords ? (
                    <p className="px-1 text-xs text-pretty break-words text-muted-foreground">
                      {priceWords}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <FloatingField
                    label="قیمت با تخفیف"
                    dir="ltr"
                    value={formatGroupedPersianDigits(form.discountPrice)}
                    onChange={(value) =>
                      setForm((f) =>
                        f ? { ...f, discountPrice: normalizeDigits(value) } : f,
                      )
                    }
                  />
                  <div className="flex flex-wrap items-center gap-2 px-1">
                    {discountWords ? (
                      <p className="text-xs text-pretty break-words text-muted-foreground">
                        {discountWords}
                      </p>
                    ) : null}
                    {discountPercent != null ? (
                      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        {toPersianDigits(String(discountPercent))}٪ تخفیف
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="inventory"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden pt-2"
        >
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pe-0.5 pb-2">
            {/* کارت ۱: ۲ ردیف × ۲ ستون */}
            <div className="rounded-xl border border-border/80 bg-card/40 p-2.5 sm:p-3">
              <h3 className="mb-2.5 text-[11px] font-medium text-muted-foreground">
                انبار و موجودی
              </h3>
              <div className="grid content-start gap-3 pt-1.5 sm:grid-cols-2">
                <SwitchField
                  label="فعال بودن انبار برای این محصول"
                  description="با روشن کردن، موجودی واقعی می‌شود و با هر خرید کم می‌گردد"
                  hint="اگر انبار خاموش باشد، محدودیت موجودی، حداقل/حداکثر سفارش و نمایش موجودی در فروشگاه اعمال نمی‌شود. با روشن شدن، موجودی کل با هر خرید کاهش می‌یابد و در صورت رسیدن به صفر، محصول خودکار ناموجود می‌شود."
                  checked={form.trackInventory}
                  onCheckedChange={(checked) =>
                    setForm((f) =>
                      f
                        ? {
                            ...f,
                            trackInventory: checked,
                            minOrderQuantity: checked
                              ? f.minOrderQuantity.trim() || "1"
                              : f.minOrderQuantity,
                            showStockInStore: checked
                              ? f.showStockInStore
                              : false,
                          }
                        : f,
                    )
                  }
                />

                <FloatingField
                  label="موجودی کل"
                  dir="ltr"
                  disabled={!form.trackInventory}
                  hint="تعداد واقعی کالا در انبار. با هر خرید موفق از این مقدار کم می‌شود."
                  value={
                    form.trackInventory
                      ? formatGroupedPersianDigits(form.stockQuantity)
                      : ""
                  }
                  onChange={(value) =>
                    setForm((f) =>
                      f ? { ...f, stockQuantity: normalizeDigits(value) } : f,
                    )
                  }
                />

                <FloatingField
                  label="حداقل سفارش"
                  dir="ltr"
                  disabled={!form.trackInventory}
                  hint="کمترین تعدادی که مشتری می‌تواند در یک سفارش بخرد. پیش‌فرض ۱ است."
                  value={
                    form.trackInventory
                      ? toPersianDigits(form.minOrderQuantity || "1")
                      : ""
                  }
                  onChange={(value) =>
                    setForm((f) =>
                      f
                        ? { ...f, minOrderQuantity: normalizeDigits(value) }
                        : f,
                    )
                  }
                />

                <FloatingField
                  label="حداکثر سفارش"
                  dir="ltr"
                  disabled={!form.trackInventory}
                  hint="اختیاری است. اگر خالی بماند، محدودیتی برای حداکثر تعداد در سفارش اعمال نمی‌شود."
                  value={
                    form.trackInventory
                      ? toPersianDigits(form.maxOrderQuantity)
                      : ""
                  }
                  onChange={(value) =>
                    setForm((f) =>
                      f
                        ? { ...f, maxOrderQuantity: normalizeDigits(value) }
                        : f,
                    )
                  }
                />
              </div>
            </div>

            {/* کارت ۲: ۱ ردیف × ۲ ستون */}
            <div className="rounded-xl border border-border/80 bg-card/40 p-2.5 sm:p-3">
              <h3 className="mb-2.5 text-[11px] font-medium text-muted-foreground">
                نمایش در فروشگاه
              </h3>
              <div className="grid content-start gap-3 pt-1.5 sm:grid-cols-2">
                <SwitchField
                  label="اعلام موجودی انبار در فروشگاه"
                  description="تعداد باقی‌مانده را در صفحه محصول به مشتری نشان می‌دهد"
                  hint="با روشن کردن، در فروشگاه تعداد باقی‌مانده نمایش داده می‌شود. می‌توانید تعیین کنید فقط وقتی موجودی به عدد مشخصی یا کمتر رسید این نمایش فعال شود؛ اگر آستانه خالی باشد، همیشه نشان داده می‌شود."
                  checked={form.trackInventory && form.showStockInStore}
                  disabled={!form.trackInventory}
                  onCheckedChange={(checked) =>
                    setForm((f) =>
                      f ? { ...f, showStockInStore: checked } : f,
                    )
                  }
                />

                <FloatingField
                  label="آستانه نمایش موجودی"
                  dir="ltr"
                  disabled={!form.trackInventory || !form.showStockInStore}
                  hint="فقط وقتی موجودی کل به این عدد یا کمتر برسد، تعداد باقی‌مانده در فروشگاه دیده می‌شود. خالی = همیشه نمایش."
                  value={
                    form.trackInventory && form.showStockInStore
                      ? toPersianDigits(form.stockDisplayThreshold)
                      : ""
                  }
                  onChange={(value) =>
                    setForm((f) =>
                      f
                        ? {
                            ...f,
                            stockDisplayThreshold: normalizeDigits(value),
                          }
                        : f,
                    )
                  }
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="specs"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden pt-2"
        >
          <ProductSpecsEditor
            specs={form.specs}
            onChange={(specs) => setForm((f) => (f ? { ...f, specs } : f))}
          />
        </TabsContent>

        <TabsContent
          value="settings"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden pt-2"
        >
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/15 px-6 text-center">
            <Settings2 className="size-8 text-muted-foreground/45" />
            <p className="text-sm font-medium">تنظیمات محصول</p>
            <p className="max-w-sm text-xs text-pretty text-muted-foreground">
              محتوای این بخش به‌زودی اضافه می‌شود.
            </p>
          </div>
        </TabsContent>

        <TabsContent
          value="reports"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden pt-2"
        >
          <ProductReportsPanel productId={String(id)} />
        </TabsContent>
      </Tabs>

      <div className="z-20 flex shrink-0 justify-stretch border-t border-border/60 bg-background/95 pt-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:justify-end sm:border-0 sm:bg-transparent sm:pt-[10px] sm:backdrop-blur-none pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Button
          type="submit"
          disabled={save.isPending || uploading}
          className="h-11 w-full touch-manipulation rounded-lg px-5 shadow-md sm:h-10 sm:w-auto"
        >
          {save.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            "ذخیره تغییرات"
          )}
        </Button>
      </div>
    </form>
  );
}
