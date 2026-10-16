"use client";

import Link from "next/link";
import {
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChartColumn,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GitCompare,
  Heart,
  Info,
  List,
  Minus,
  Package,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Truck,
  X,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { ProductEngagement } from "@/features/products/ProductEngagement";
import { RelatedProductsSections } from "@/features/products/RelatedProductsSections";
import { api, getApiErrorMessage } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { resolveProductImageUrl } from "@/lib/product-image";
import { getProductDisplayPrices } from "@/lib/product-price";
import {
  isLightSwatch,
  resolveSwatchColor,
} from "@/lib/product-color";
import {
  formatPrice,
  normalizeShopCurrency,
  toDisplayAmount,
} from "@/lib/shop-currency";
import { getShopIndustryPreset } from "@/lib/shop-industry-presets";
import { useShopSettings } from "@/lib/shop-settings-api";
import { cn } from "@/lib/utils";
import type { Cart, ProductDetail, ProductSpec } from "@/types/api";

function formatAmountFa(valueInToman: number, currency?: string | null) {
  const unit = normalizeShopCurrency(currency);
  return toPersianDigits(
    new Intl.NumberFormat("fa-IR").format(toDisplayAmount(valueInToman, unit)),
  );
}

function isImageMedia(i: { mediaKind?: number | null; imagePath: string }) {
  if (i.mediaKind === 1) return false;
  return !/\.(mp4|webm|mov)(\?|$)/i.test(i.imagePath);
}

function orderParamSpecs(product: ProductDetail): ProductSpec[] {
  return (product.specs ?? []).filter(
    (s) => s.isOrderParameter && (s.values?.length ?? 0) >= 2,
  );
}

function displaySpecs(product: ProductDetail): ProductSpec[] {
  return (product.specs ?? []).filter(
    (s) => !s.isOrderParameter && (s.values?.length ?? 0) > 0,
  );
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const total = Math.floor(diff / 1000);
  return {
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    finished: total <= 0,
  };
}

type ProductDetailViewProps = {
  product: ProductDetail;
  currency?: string | null;
};

export function ProductDetailView({
  product,
  currency,
}: ProductDetailViewProps) {
  const { data: shopSettings } = useShopSettings();
  const industry = useMemo(
    () => getShopIndustryPreset(shopSettings?.industryKey),
    [shopSettings?.industryKey],
  );
  const images = useMemo(() => {
    const list = product.images
      .filter((i) => isImageMedia(i))
      .sort(
        (a, b) =>
          Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
      )
      .map((i) => resolveProductImageUrl(i.imagePath));
    return list.length ? list : [resolveProductImageUrl(null)];
  }, [product.images]);

  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [descExpanded, setDescExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const offerEnd = useMemo(() => endOfToday(), []);
  const { hours, minutes, seconds, finished } = useCountdown(offerEnd);
  const activeSrc = images[activeImage] ?? images[0];
  const ZOOM_SCALE = 1.55;

  const updateZoomFromEvent = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const goLightbox = (dir: -1 | 1) => {
    if (images.length <= 1) return;
    setActiveImage((i) => (i + dir + images.length) % images.length);
  };

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setLightboxOpen(false);
      if (ev.key === "ArrowLeft") goLightbox(1);
      if (ev.key === "ArrowRight") goLightbox(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only bind while open
  }, [lightboxOpen, images.length]);

  const activeVariants = useMemo(
    () => product.variants.filter((v) => v.isActive),
    [product.variants],
  );
  const selected = activeVariants[0];
  const params = useMemo(() => orderParamSpecs(product), [product]);
  const featureSpecs = useMemo(
    () => displaySpecs(product).slice(0, 6),
    [product],
  );
  const allDisplaySpecs = useMemo(() => displaySpecs(product), [product]);

  const { current, original, discountPercent } =
    getProductDisplayPrices(product);
  const hasAmazing = discountPercent != null && discountPercent > 0;

  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const spec of orderParamSpecs(product)) {
      const first = spec.values[0];
      if (spec.id && first?.id) initial[spec.id] = first.id;
    }
    setSelections(initial);
    setActiveImage(0);
  }, [product.id, product.specs]);

  const selectedValueIds = useMemo(
    () =>
      params
        .map((s) => (s.id ? selections[s.id] : undefined))
        .filter((id): id is string => Boolean(id)),
    [params, selections],
  );

  const adjustment = useMemo(() => {
    let sum = 0;
    for (const spec of params) {
      if (!spec.id) continue;
      const valueId = selections[spec.id];
      const value = spec.values.find((v) => v.id === valueId);
      if (value) sum += value.priceAdjustment || 0;
    }
    return sum;
  }, [params, selections]);

  const unitPrice = current + adjustment;
  const originalWithAdj = original != null ? original + adjustment : null;

  const track = product.trackInventory;
  const minQty = track ? Math.max(1, product.minOrderQuantity || 1) : 1;
  const maxFromProduct =
    track && product.maxOrderQuantity != null
      ? product.maxOrderQuantity
      : undefined;
  const maxFromStock = track
    ? selected?.stockQuantity ?? product.stockQuantity
    : undefined;
  const maxQty =
    maxFromProduct != null && maxFromStock != null
      ? Math.min(maxFromProduct, maxFromStock)
      : (maxFromProduct ?? maxFromStock);

  const cart = useCartStore((s) => s.cart);
  const setCart = useCartStore((s) => s.setCart);
  const queryClient = useQueryClient();

  const cartItem = useMemo(() => {
    if (!cart?.items?.length || !selected?.id) return null;
    return (
      cart.items.find((item) => {
        if (item.productVariantId !== selected.id) return false;
        if (item.productId !== product.id) return false;
        const wanted = new Set(selectedValueIds);
        const have = new Set(
          (item.selectedOptions ?? []).map((o) => o.valueId),
        );
        if (wanted.size !== have.size) return false;
        for (const id of wanted) {
          if (!have.has(id)) return false;
        }
        return true;
      }) ?? null
    );
  }, [cart, product.id, selected?.id, selectedValueIds]);

  useEffect(() => {
    void api
      .post(`/api/products/${encodeURIComponent(product.slug)}/view`)
      .catch(() => undefined);
  }, [product.slug]);

  const syncCart = (next: Cart) => {
    setCart(next);
    queryClient.setQueryData(["cart"], next);
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selected?.id) throw new Error("محصول قابل سفارش نیست");
      for (const spec of params) {
        if (!spec.id || !selections[spec.id]) {
          throw new Error(`لطفاً «${spec.name}» را انتخاب کنید`);
        }
      }
      const { data } = await api.post<Cart>("/api/cart/items", {
        productVariantId: selected.id,
        quantity: minQty,
        selectedSpecValueIds: selectedValueIds,
      });
      return data;
    },
    onSuccess: (next) => {
      syncCart(next);
      toast.success("به سبد خرید اضافه شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: async (quantity: number) => {
      if (!cartItem) throw new Error("آیتم سبد یافت نشد");
      const { data } = await api.put<Cart>(`/api/cart/items/${cartItem.id}`, {
        quantity,
      });
      return data;
    },
    onSuccess: syncCart,
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      if (!cartItem) throw new Error("آیتم سبد یافت نشد");
      const { data } = await api.delete<Cart>(
        `/api/cart/items/${cartItem.id}`,
      );
      return data;
    },
    onSuccess: (next) => {
      syncCart(next);
      toast.success("از سبد حذف شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const likeMutation = useMutation({
    mutationFn: async () =>
      (
        await api.post<{ liked: boolean; likesCount: number }>(
          `/api/products/${product.id}/like`,
        )
      ).data,
    onSuccess: (data) => setLiked(data.liked),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const remaining = selected?.stockQuantity ?? product.stockQuantity;
  const inStock = Boolean(selected) && (!track || remaining > 0);
  const canPurchase = product.isAvailable && inStock;
  const cartBusy =
    addMutation.isPending ||
    updateMutation.isPending ||
    removeMutation.isPending;
  const currencyUnit = normalizeShopCurrency(currency);
  const avg = product.averageRating ?? 0;
  const rated = product.ratingCount ?? 0;
  const comments = product.commentCount ?? 0;
  const avgLabel =
    avg > 0 ? toPersianDigits(avg.toFixed(1).replace(".", "٫")) : null;

  const share = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("لینک محصول کپی شد");
      }
    } catch {
      /* cancelled */
    }
  };

  const pad = (n: number) => toPersianDigits(String(n).padStart(2, "0"));

  const priceBlock = (
    <div className="space-y-1">
      {originalWithAdj != null && discountPercent != null ? (
        <div className="flex items-center justify-end gap-2">
          <span className="text-[13px] text-[#c0c2c5] line-through">
            {formatAmountFa(originalWithAdj, currency)}
          </span>
          {discountPercent > 0 ? (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground">
              {toPersianDigits(String(discountPercent))}٪
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-baseline justify-end gap-1">
        <span className="text-[22px] font-black tracking-tight text-[#0c0c0c] dark:text-foreground">
          {formatAmountFa(unitPrice, currency)}
        </span>
        <span className="text-[12px] text-[#424750] dark:text-muted-foreground">
          {currencyUnit}
        </span>
      </div>
    </div>
  );

  const cartControls = canPurchase ? (
    cartItem ? (
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-[#0c0c0c] dark:text-foreground">
            در سبد شما
          </p>
          <Link
            href="/cart"
            className="mt-0.5 inline-block text-[12px] font-medium text-[#19bfd3] hover:underline"
          >
            مشاهده سبد خرید
          </Link>
        </div>
        <div className="inline-flex h-11 items-center gap-1 rounded-lg border border-[#e0e0e2] bg-background px-1 shadow-sm dark:border-white/10">
          <button
            type="button"
            aria-label="افزایش"
            disabled={cartBusy || (maxQty != null && cartItem.quantity >= maxQty)}
            onClick={() => updateMutation.mutate(cartItem.quantity + 1)}
            className="inline-flex size-9 items-center justify-center text-primary disabled:opacity-40"
          >
            <Plus className="size-4" strokeWidth={2.5} />
          </button>
          <span className="min-w-7 text-center text-[14px] font-bold text-primary">
            {toPersianDigits(String(cartItem.quantity))}
          </span>
          {cartItem.quantity <= 1 ? (
            <button
              type="button"
              aria-label="حذف از سبد"
              disabled={cartBusy}
              onClick={() => removeMutation.mutate()}
              className="inline-flex size-9 items-center justify-center text-primary disabled:opacity-40"
            >
              <Trash2 className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="کاهش"
              disabled={cartBusy}
              onClick={() => updateMutation.mutate(cartItem.quantity - 1)}
              className="inline-flex size-9 items-center justify-center text-primary disabled:opacity-40"
            >
              <Minus className="size-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    ) : (
      <Button
        className="h-12 w-full rounded-lg text-[14px] font-bold"
        disabled={cartBusy}
        onClick={() => addMutation.mutate()}
      >
        {addMutation.isPending ? "در حال افزودن..." : "افزودن به سبد"}
      </Button>
    )
  ) : (
    <Button className="h-12 w-full rounded-lg" disabled variant="secondary">
      ناموجود
    </Button>
  );

  return (
    <div className="bg-[#f5f5f5] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] dark:bg-background lg:pb-0">
      <div className="mx-auto w-full max-w-[1676px] px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-[11px] text-[#81858b] sm:mb-4 sm:text-[12px]">
          <Link href="/" className="hover:text-primary">
            فروشگاه
          </Link>
          <ChevronLeft className="size-3 opacity-40" />
          {product.categoryName ? (
            <>
              <Link
                href={
                  product.categorySlug
                    ? `/products?category=${encodeURIComponent(product.categorySlug)}`
                    : `/products?search=${encodeURIComponent(product.categoryName)}`
                }
                className="hover:text-primary"
              >
                {product.categoryName}
              </Link>
              <ChevronLeft className="size-3 opacity-40" />
            </>
          ) : null}
          {product.brandName ? (
            <>
              <Link
                href={`/products?brand=${encodeURIComponent(product.brandSlug || product.brandName)}`}
                className="hover:text-primary"
              >
                {product.brandName}
              </Link>
              <ChevronLeft className="size-3 opacity-40" />
            </>
          ) : null}
          <span className="line-clamp-1 text-[#424750] dark:text-foreground">
            {product.name}
          </span>
        </nav>

        <div className="overflow-hidden rounded-lg border border-[#e0e0e2] bg-white dark:border-white/10 dark:bg-card">
          <div className="grid items-start gap-0 lg:grid-cols-[minmax(300px,1fr)_minmax(0,1.2fr)_minmax(280px,320px)]">
            {/* gallery — right in RTL */}
            <section className="min-w-0 border-b border-[#f0f0f1] p-4 lg:border-b-0 lg:border-e dark:border-white/10">
              {hasAmazing && !finished ? (
                <div className="mb-3 flex h-10 items-center justify-between gap-3 rounded-lg bg-[color-mix(in_oklab,var(--primary)_12%,white)] px-3 text-primary dark:bg-[color-mix(in_oklab,var(--primary)_22%,transparent)]">
                  <p className="text-[13px] font-bold">پیشنهاد شگفت‌انگیز</p>
                  <div
                    className="flex items-center gap-1.5 text-[13px] font-bold tabular-nums"
                    dir="ltr"
                  >
                    <span>{pad(hours)}</span>
                    <span className="opacity-50">:</span>
                    <span>{pad(minutes)}</span>
                    <span className="opacity-50">:</span>
                    <span>{pad(seconds)}</span>
                    <Clock3 className="ms-0.5 size-4 opacity-80" />
                  </div>
                </div>
              ) : null}

              <div className="relative">
                <div className="absolute start-0 top-0 z-20 flex flex-col gap-3.5">
                  {[
                    {
                      label: liked ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی",
                      icon: Heart,
                      onClick: () => likeMutation.mutate(),
                      active: liked,
                    },
                    {
                      label: "اشتراک‌گذاری",
                      icon: Share2,
                      onClick: () => void share(),
                    },
                    { label: "اطلاع‌رسانی شگفت‌انگیز", icon: Bell },
                    { label: "نمودار قیمت", icon: ChartColumn },
                    { label: "مقایسه", icon: GitCompare },
                    { label: "افزودن به لیست", icon: List },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        aria-label={item.label}
                        title={item.label}
                        onClick={item.onClick}
                        className="text-[#424750] transition hover:text-primary dark:text-foreground"
                      >
                        <Icon
                          className={cn(
                            "size-5",
                            item.active && "fill-primary text-primary",
                          )}
                          strokeWidth={1.75}
                        />
                      </button>
                    );
                  })}
                </div>

                <div
                  className="group relative cursor-zoom-in overflow-hidden bg-white dark:bg-transparent"
                  onMouseEnter={(e) => {
                    if (window.matchMedia("(pointer: fine)").matches) {
                      setZoomActive(true);
                      updateZoomFromEvent(e);
                    }
                  }}
                  onMouseMove={updateZoomFromEvent}
                  onMouseLeave={() => setZoomActive(false)}
                  onClick={() => setLightboxOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setLightboxOpen(true);
                    }
                  }}
                  aria-label="بزرگ‌نمایی تصویر"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeSrc}
                    alt={product.name}
                    className="mx-auto aspect-square max-h-[380px] w-full object-contain p-6 transition-transform duration-100 ease-out will-change-transform sm:max-h-[440px] sm:p-8"
                    style={
                      zoomActive
                        ? {
                            transform: `scale(${ZOOM_SCALE})`,
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                          }
                        : undefined
                    }
                    draggable={false}
                  />
                  {!zoomActive ? (
                    <span className="pointer-events-none absolute end-2 bottom-2 hidden items-center gap-1 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100 lg:inline-flex">
                      <ZoomIn className="size-3" />
                      زوم
                    </span>
                  ) : null}
                </div>
              </div>

              {images.length > 1 ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "size-[62px] shrink-0 overflow-hidden rounded-lg border bg-white transition sm:size-[68px] dark:bg-transparent",
                        i === activeImage
                          ? "border-primary"
                          : "border-[#e0e0e2] hover:border-primary/50 dark:border-white/10",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="size-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </section>

            {/* center info */}
            <section className="min-w-0 space-y-4 border-b border-[#f0f0f1] p-4 lg:border-b-0 lg:border-e dark:border-white/10 sm:p-5">
              {(product.categoryName || product.brandName) && (
                <p className="text-[12px] text-[#19bfd3]">
                  {[product.brandName, product.categoryName]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
              )}

              <h1 className="text-[15px] font-bold leading-7 text-[#0c0c0c] sm:text-[17px] sm:leading-8 dark:text-foreground">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 border-b border-[#f0f0f1] pb-3 dark:border-white/10">
                {avgLabel ? (
                  <button
                    type="button"
                    onClick={() => setTab("reviews")}
                    className="inline-flex items-center gap-1 text-[12px] text-[#424750] hover:text-primary dark:text-foreground"
                  >
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold tabular-nums">{avgLabel}</span>
                    {rated > 0 ? (
                      <span className="text-[#81858b]">
                        ({toPersianDigits(String(rated))} امتیاز)
                      </span>
                    ) : null}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTab("reviews")}
                    className="text-[12px] text-[#81858b] hover:text-primary"
                  >
                    بدون امتیاز
                  </button>
                )}

                {comments > 0 ? (
                  <button
                    type="button"
                    onClick={() => setTab("reviews")}
                    className="inline-flex items-center gap-1 rounded-full bg-[#f0f0f1] px-2.5 py-1 text-[11px] font-medium text-[#5a5c7a] hover:bg-[#e8e8ea] dark:bg-muted dark:text-foreground"
                  >
                    <Sparkles className="size-3 text-[#7c3aed]" />
                    خلاصه دیدگاه‌ها
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setTab("reviews")}
                  className="inline-flex items-center gap-0.5 rounded-full bg-[#f0f0f1] px-2.5 py-1 text-[11px] text-[#81858b] hover:bg-[#e8e8ea] dark:bg-muted"
                >
                  {toPersianDigits(String(comments))} دیدگاه
                  <ChevronLeft className="size-3" />
                </button>

                {product.sku || product.productCode ? (
                  <span className="ms-auto max-w-full truncate text-[11px] text-[#81858b]">
                    کد کالا:{" "}
                    <span
                      className="text-[#424750] dark:text-foreground"
                      dir="ltr"
                    >
                      {toPersianDigits(product.sku || product.productCode)}
                    </span>
                  </span>
                ) : null}
              </div>

              {params.map((spec) => (
                <div key={spec.id ?? spec.name} className="space-y-2.5">
                  <p className="text-[12px] text-[#424750] dark:text-foreground">
                    {spec.name}:{" "}
                    <span className="font-bold">
                      {spec.id
                        ? spec.values.find((v) => v.id === selections[spec.id!])
                            ?.value
                        : null}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {spec.values.map((v) => {
                      if (!spec.id || !v.id) return null;
                      const active = selections[spec.id] === v.id;
                      const looksLikeColor =
                        (/رنگ|color|colour/i.test(spec.name) ||
                          Boolean(v.colorHex)) &&
                        !/[۰-۹0-9]/.test(v.value) &&
                        v.value.length <= 24;
                      const swatch = looksLikeColor
                        ? resolveSwatchColor(v.value, v.colorHex)
                        : null;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          title={v.value}
                          onClick={() =>
                            setSelections((prev) => ({
                              ...prev,
                              [spec.id!]: v.id!,
                            }))
                          }
                          className={cn(
                            "transition",
                            looksLikeColor
                              ? cn(
                                  "relative size-8 rounded-full border-2",
                                  active
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-[#e0e0e2] dark:border-white/10",
                                )
                              : cn(
                                  "rounded-lg border px-3 py-2 text-[12px]",
                                  active
                                    ? "border-primary bg-primary/5 font-medium text-foreground"
                                    : "border-[#e0e0e2] text-[#424750] hover:border-primary/40 dark:border-white/10 dark:text-foreground",
                                ),
                          )}
                          style={
                            swatch ? { backgroundColor: swatch } : undefined
                          }
                        >
                          {looksLikeColor ? (
                            active ? (
                              <Check
                                className={cn(
                                  "absolute inset-0 m-auto size-3.5",
                                  isLightSwatch(swatch || v.value)
                                    ? "text-[#424750]"
                                    : "text-white",
                                )}
                                strokeWidth={3}
                              />
                            ) : (
                              <span className="sr-only">{v.value}</span>
                            )
                          ) : (
                            <>
                              {v.value}
                              {(v.priceAdjustment || 0) !== 0 ? (
                                <span className="ms-1 text-[11px] text-muted-foreground">
                                  {(v.priceAdjustment || 0) > 0 ? "+" : ""}
                                  {formatPrice(v.priceAdjustment || 0, currency)}
                                </span>
                              ) : null}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {featureSpecs.length > 0 ? (
                <div>
                  <p className="mb-2.5 text-[13px] font-bold text-[#0c0c0c] dark:text-foreground">
                    ویژگی‌ها
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {featureSpecs.map((s) => (
                      <div
                        key={s.id ?? s.name}
                        className="rounded-lg bg-[#f0f0f1] px-3 py-2.5 dark:bg-muted"
                      >
                        <p className="text-[11px] text-[#81858b]">{s.name}</p>
                        <p className="mt-0.5 line-clamp-2 text-[12px] font-medium text-[#0c0c0c] dark:text-foreground">
                          {(s.values ?? [])
                            .map((v) => v.value)
                            .filter(Boolean)
                            .join("، ")}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("specs");
                      document
                        .getElementById("product-tabs")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#19bfd3] hover:underline"
                  >
                    مشاهده همه ویژگی‌ها
                    <ChevronLeft className="size-3.5" />
                  </button>
                </div>
              ) : null}

              <div className="flex items-start gap-2 rounded-lg bg-[#f0f0f1]/80 px-3 py-2.5 text-[11px] leading-5 text-[#81858b] dark:bg-muted/50">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                <span>{industry.returnNote}</span>
              </div>
            </section>

            {/* buy box */}
            <aside className="min-w-0 bg-[#fafafa] p-3 dark:bg-muted/20 lg:sticky lg:top-20 lg:self-start lg:bg-transparent lg:p-4 dark:lg:bg-transparent">
              <div className="overflow-hidden rounded-lg border border-[#e0e0e2] bg-white shadow-sm dark:border-white/10 dark:bg-card">
                <div className="space-y-4 px-4 py-4">
                  {canPurchase ? (
                    <p className="flex items-center gap-1.5 text-[12px] text-emerald-600">
                      <Check className="size-3.5" strokeWidth={2.5} />
                      موجود در انبار
                    </p>
                  ) : (
                    <p className="text-[12px] text-destructive">ناموجود</p>
                  )}
                  {canPurchase ? priceBlock : null}
                  <div className="hidden lg:block">{cartControls}</div>
                </div>

                <div className="flex items-center gap-2 border-t border-[#f0f0f1] px-4 py-3.5 text-[12px] text-[#424750] dark:border-white/10 dark:text-foreground">
                  <ShieldCheck className="size-5 shrink-0 text-[#424750]" />
                  <span>{industry.warranty}</span>
                </div>

                <div className="border-t border-[#f0f0f1] px-4 py-3.5 dark:border-white/10">
                  <div className="mb-2.5 flex items-center gap-2 text-[13px] font-bold text-[#0c0c0c] dark:text-foreground">
                    <Package className="size-4 text-[#19bfd3]" />
                    {industry.deliveryTitle}
                  </div>
                  <ul className="space-y-2 text-[12px] text-[#424750] dark:text-foreground">
                    {industry.deliveryLines.map((line, idx) => (
                      <li key={line} className="flex items-start gap-2">
                        <Truck
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            idx === 0 ? "text-primary" : "text-emerald-600",
                          )}
                        />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* tabs */}
        <div
          id="product-tabs"
          className="mt-4 overflow-hidden rounded-lg border border-[#e0e0e2] bg-white dark:border-white/10 dark:bg-card"
        >
          <div className="sticky top-0 z-[5] flex gap-1 overflow-x-auto border-b border-[#f0f0f1] bg-white/95 backdrop-blur dark:border-white/10 dark:bg-card/95">
            {(
              [
                { id: "desc" as const, label: "معرفی" },
                { id: "specs" as const, label: "مشخصات" },
                {
                  id: "reviews" as const,
                  label:
                    comments > 0
                      ? `دیدگاه‌ها (${toPersianDigits(String(comments))})`
                      : "دیدگاه‌ها",
                },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative shrink-0 px-4 py-3.5 text-[13px] font-medium transition",
                  tab === t.id
                    ? "text-primary"
                    : "text-[#81858b] hover:text-[#424750] dark:hover:text-foreground",
                )}
              >
                {t.label}
                {tab === t.id ? (
                  <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-primary" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-5 lg:p-6">
            {tab === "desc" ? (
              product.description?.trim() ? (
                <div>
                  <h2 className="mb-3 text-[16px] font-bold text-[#0c0c0c] dark:text-foreground">
                    معرفی
                  </h2>
                  <div className="relative">
                    <div
                      className={cn(
                        "prose prose-sm dark:prose-invert max-w-none w-full overflow-x-auto leading-8 text-[#424750] dark:text-foreground [&_img]:max-w-full [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto",
                        !descExpanded && "max-h-[260px] overflow-hidden",
                      )}
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                    {!descExpanded ? (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-card"
                      />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDescExpanded((v) => !v)}
                    className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[#19bfd3] hover:underline"
                  >
                    {descExpanded ? "بستن" : "مشاهده بیشتر"}
                    <ChevronLeft
                      className={cn(
                        "size-4 transition",
                        descExpanded ? "rotate-90" : "-rotate-90",
                      )}
                    />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  توضیحی برای این محصول ثبت نشده است.
                </p>
              )
            ) : null}

            {tab === "specs" ? (
              allDisplaySpecs.length > 0 ? (
                <div>
                  <h2 className="mb-4 text-[16px] font-bold text-[#0c0c0c] dark:text-foreground">
                    مشخصات
                  </h2>
                  <div className="overflow-hidden rounded-lg border border-[#e0e0e2] dark:border-white/10">
                    <table className="w-full text-[13px]">
                      <tbody>
                        {allDisplaySpecs.map((s, i) => (
                          <tr
                            key={s.id ?? s.name}
                            className={cn(
                              "border-b border-[#e0e0e2] last:border-0 dark:border-white/10",
                              i % 2 === 0 && "bg-[#fafafa] dark:bg-muted/20",
                            )}
                          >
                            <th className="w-[34%] px-4 py-3.5 text-start font-medium text-[#81858b] sm:w-[28%]">
                              {s.name}
                            </th>
                            <td className="px-4 py-3.5 text-[#0c0c0c] dark:text-foreground">
                              {(s.values ?? [])
                                .map((v) => v.value)
                                .filter(Boolean)
                                .join("، ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  مشخصاتی ثبت نشده است.
                </p>
              )
            ) : null}

            {tab === "reviews" ? (
              <div id="product-reviews" className="w-full">
                <h2 className="mb-4 text-[16px] font-bold text-[#0c0c0c] dark:text-foreground">
                  امتیاز و دیدگاه کاربران
                </h2>
                <ProductEngagement
                  productId={product.id}
                  productSlug={product.slug}
                  averageRating={product.averageRating}
                  ratingCount={product.ratingCount}
                  commentCount={product.commentCount}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <RelatedProductsSections product={product} />

      {/* mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e0e0e2] bg-white px-3 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-card lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto flex max-w-[1676px] flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
          {canPurchase ? (
            <div className="min-w-0 sm:flex-1">{priceBlock}</div>
          ) : null}
          <div className="w-full shrink-0 sm:w-[min(52%,220px)]">{cartControls}</div>
        </div>
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/75"
          role="dialog"
          aria-modal="true"
          aria-label="نمایش بزرگ تصویر"
          onClick={() => setLightboxOpen(false)}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (t) (e.currentTarget as HTMLElement).dataset.touchX = String(t.clientX);
          }}
          onTouchEnd={(e) => {
            const start = Number((e.currentTarget as HTMLElement).dataset.touchX || 0);
            const end = e.changedTouches[0]?.clientX ?? start;
            const dx = end - start;
            if (Math.abs(dx) < 50) return;
            // RTL: swipe right → previous, swipe left → next
            goLightbox(dx > 0 ? -1 : 1);
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <button
              type="button"
              aria-label="بستن"
              className="inline-flex size-9 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="size-4" />
            </button>
            {images.length > 1 ? (
              <span className="text-[13px] tabular-nums text-white/80">
                {toPersianDigits(String(activeImage + 1))} /{" "}
                {toPersianDigits(String(images.length))}
              </span>
            ) : (
              <span />
            )}
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-12 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="تصویر بعدی"
                  className="absolute start-2 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:start-4"
                  onClick={() => goLightbox(1)}
                >
                  <ChevronRight className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="تصویر قبلی"
                  className="absolute end-2 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:end-4"
                  onClick={() => goLightbox(-1)}
                >
                  <ChevronLeft className="size-5" />
                </button>
              </>
            ) : null}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeSrc}
              alt={product.name}
              className="max-h-[68vh] max-w-[min(100%,560px)] rounded-lg bg-white object-contain p-4 shadow-lg"
              draggable={false}
            />
          </div>

          {images.length > 1 ? (
            <div
              className="flex justify-center gap-2 overflow-x-auto px-4 pb-5"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, i) => (
                <button
                  key={`${src}-lb-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "size-12 shrink-0 overflow-hidden rounded-md border-2 bg-white/90 transition sm:size-14",
                    i === activeImage
                      ? "border-primary"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="size-full object-contain p-0.5" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

