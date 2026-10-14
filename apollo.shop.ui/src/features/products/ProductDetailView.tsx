"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChartColumn,
  Check,
  ChevronLeft,
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
  formatPrice,
  normalizeShopCurrency,
  toDisplayAmount,
} from "@/lib/shop-currency";
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
  const offerEnd = useMemo(() => endOfToday(), []);
  const { hours, minutes, seconds, finished } = useCountdown(offerEnd);

  const activeVariants = useMemo(
    () => product.variants.filter((v) => v.isActive),
    [product.variants],
  );
  const selected = activeVariants[0];
  const params = useMemo(() => orderParamSpecs(product), [product]);
  const featureSpecs = useMemo(
    () => displaySpecs(product).slice(0, 4),
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

  return (
    <div className="bg-background">
      <div className="mx-auto w-full max-w-[1676px] px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
        {/* breadcrumb */}
        <nav className="mb-3 flex flex-wrap items-center gap-1 text-[11px] text-[#81858b] sm:mb-4 sm:text-[12px]">
          <Link href="/" className="hover:text-primary">
            فروشگاه
          </Link>
          <ChevronLeft className="size-3 opacity-40" />
          {product.categoryName ? (
            <>
              <Link
                href={`/products?search=${encodeURIComponent(product.categoryName)}`}
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
                href={`/products?brand=${encodeURIComponent(product.brandName)}`}
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

        {/* Digikala-like 3 columns: gallery | info | buybox (RTL: first=right) */}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(280px,340px)] lg:gap-6 xl:gap-8">
          {/* gallery */}
          <section className="min-w-0">
            {hasAmazing && !finished ? (
              <div className="mb-3 flex h-11 items-center justify-between gap-3 rounded-md bg-[color-mix(in_oklab,var(--primary)_11%,white)] px-3.5 text-primary dark:bg-[color-mix(in_oklab,var(--primary)_22%,transparent)]">
                <p className="text-[13px] font-bold tracking-tight">
                  پیشنهاد شگفت‌انگیز
                </p>
                <div
                  className="flex items-center gap-1.5 text-[13px] font-bold tabular-nums"
                  dir="ltr"
                >
                  <span>{pad(hours)}</span>
                  <span className="opacity-50">:</span>
                  <span>{pad(minutes)}</span>
                  <span className="opacity-50">:</span>
                  <span>{pad(seconds)}</span>
                  <Clock3 className="ms-0.5 size-4 opacity-80" strokeWidth={2} />
                </div>
              </div>
            ) : null}

            <div className="relative">
              <div className="absolute start-0 top-1 z-10 flex flex-col gap-3 ps-0.5">
                {[
                  {
                    label: liked ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی",
                    icon: Heart,
                    onClick: () => likeMutation.mutate(),
                    active: liked,
                  },
                  { label: "اشتراک‌گذاری", icon: Share2, onClick: () => void share() },
                  { label: "اطلاع‌رسانی", icon: Bell },
                  { label: "نمودار قیمت", icon: ChartColumn },
                  { label: "مقایسه", icon: GitCompare },
                  { label: "لیست", icon: List },
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

              <div className="overflow-hidden rounded-md bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[activeImage] ?? images[0]}
                  alt={product.name}
                  className="mx-auto aspect-square max-h-[420px] w-full object-contain p-2 sm:max-h-[480px] sm:p-4"
                />
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
                      "size-[64px] shrink-0 overflow-hidden rounded-md border bg-background transition sm:size-[72px]",
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

          {/* middle info */}
          <section className="min-w-0 space-y-4">
            {(product.categoryName || product.brandName) && (
              <p className="text-[12px] text-[#19bfd3]">
                {[product.brandName, product.categoryName]
                  .filter(Boolean)
                  .join(" / ")}
              </p>
            )}

            <h1 className="text-[16px] font-bold leading-8 text-[#0c0c0c] sm:text-[18px] sm:leading-9 dark:text-foreground">
              {product.name}
            </h1>

            {(() => {
              const avg = product.averageRating ?? 0;
              const rated = product.ratingCount ?? 0;
              const comments = product.commentCount ?? 0;
              const avgLabel =
                avg > 0
                  ? toPersianDigits(avg.toFixed(1).replace(".", "٫"))
                  : null;
              return (
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
                          (امتیاز {toPersianDigits(String(rated))} خریدار)
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
                    className="inline-flex items-center gap-0.5 rounded-full bg-[#f0f0f1] px-2.5 py-1 text-[11px] text-[#81858b] hover:bg-[#e8e8ea] dark:bg-muted dark:text-muted-foreground"
                  >
                    {toPersianDigits(String(comments))} دیدگاه
                    <ChevronLeft className="size-3" />
                  </button>

                  {product.sku || product.productCode ? (
                    <span className="ms-auto text-[11px] text-[#81858b]">
                      کد:{" "}
                      <span className="text-[#424750] dark:text-foreground" dir="ltr">
                        {toPersianDigits(product.sku || product.productCode)}
                      </span>
                    </span>
                  ) : null}
                </div>
              );
            })()}

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
                      /رنگ|color/i.test(spec.name) &&
                      !/[۰-۹0-9]/.test(v.value) &&
                      v.value.length <= 20;
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
                                  ? "border-primary"
                                  : "border-[#e0e0e2] dark:border-white/10",
                              )
                            : cn(
                                "rounded-md border px-3 py-2 text-[12px]",
                                active
                                  ? "border-primary bg-primary/5 font-medium text-foreground"
                                  : "border-[#e0e0e2] text-[#424750] hover:border-primary/40 dark:border-white/10 dark:text-foreground",
                              ),
                        )}
                        style={
                          looksLikeColor
                            ? {
                                backgroundColor: guessColor(v.value),
                              }
                            : undefined
                        }
                      >
                        {looksLikeColor ? (
                          active ? (
                            <Check
                              className={cn(
                                "absolute inset-0 m-auto size-3.5",
                                isLightColor(v.value)
                                  ? "text-[#424750]"
                                  : "text-white",
                              )}
                              strokeWidth={3}
                            />
                          ) : null
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
                <p className="mb-2.5 text-[12px] font-bold text-[#0c0c0c] dark:text-foreground">
                  ویژگی‌ها
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {featureSpecs.map((s) => (
                    <div
                      key={s.id ?? s.name}
                      className="rounded-md bg-[#f0f0f1] px-3 py-2.5 dark:bg-muted"
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
                  onClick={() => setTab("specs")}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md border border-[#e0e0e2] bg-background py-2.5 text-[12px] font-medium text-[#0c0c0c] hover:bg-[#fafafa] dark:border-white/10 dark:text-foreground dark:hover:bg-muted/40"
                >
                  مشاهده همه ویژگی‌ها
                </button>
              </div>
            ) : null}

            <div className="flex items-start gap-2 rounded-md bg-[#f0f0f1]/70 px-3 py-2.5 text-[11px] leading-5 text-[#81858b] dark:bg-muted/50">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <span>
                امکان برگشت کالا در گروه کالایی با دلیل «انصراف از خرید» تنها در
                صورتی مورد قبول است که پلمب کالا باز نشده باشد.
              </span>
            </div>
          </section>

          {/* sticky buy box — Digikala style */}
          <aside className="min-w-0 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-md border border-[#e0e0e2] bg-background dark:border-white/10">
              {/* seller */}
              <div className="space-y-3 border-b border-[#f0f0f1] px-4 py-3.5 dark:border-white/10">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-bold text-[#0c0c0c] dark:text-foreground">
                    فروشنده
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    آ
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#0c0c0c] dark:text-foreground">
                      فروشگاه آپولو
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-emerald-600">
                      <Check className="size-3.5" strokeWidth={2.5} />
                      رضایت {toPersianDigits("۹۹.۶")}٪ از کالا
                    </p>
                  </div>
                </div>
              </div>

              {/* price + cart action */}
              <div className="space-y-4 px-4 py-4">
                {canPurchase ? (
                  <>
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

                    {cartItem ? (
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
                        <div className="inline-flex h-11 items-center gap-1 rounded-md border border-[#e0e0e2] bg-background px-1 shadow-sm dark:border-white/10">
                          <button
                            type="button"
                            aria-label="افزایش"
                            disabled={
                              cartBusy ||
                              (maxQty != null && cartItem.quantity >= maxQty)
                            }
                            onClick={() =>
                              updateMutation.mutate(cartItem.quantity + 1)
                            }
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
                              onClick={() =>
                                updateMutation.mutate(cartItem.quantity - 1)
                              }
                              className="inline-flex size-9 items-center justify-center text-primary disabled:opacity-40"
                            >
                              <Minus className="size-4" strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="h-12 w-full rounded-md text-[14px] font-bold"
                        disabled={cartBusy}
                        onClick={() => addMutation.mutate()}
                      >
                        {addMutation.isPending
                          ? "در حال افزودن..."
                          : "افزودن به سبد خرید"}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    className="h-12 w-full rounded-md"
                    disabled
                    variant="secondary"
                  >
                    ناموجود
                  </Button>
                )}
              </div>

              {/* warranty */}
              <div className="flex items-center gap-2 border-t border-[#f0f0f1] px-4 py-3.5 text-[12px] text-[#424750] dark:border-white/10 dark:text-foreground">
                <ShieldCheck className="size-5 shrink-0" strokeWidth={1.75} />
                <span>گارانتی اصالت و سلامت فیزیکی کالا</span>
              </div>

              {/* delivery */}
              <div className="border-t border-[#f0f0f1] px-4 py-3.5 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#0c0c0c] dark:text-foreground">
                    <Package className="size-4 text-[#19bfd3]" />
                    روش‌ها و هزینه‌های تحویل
                  </div>
                  <ChevronLeft className="size-4 text-[#a1a3a8]" />
                </div>
                <ul className="space-y-2.5 text-[12px] text-[#424750] dark:text-foreground">
                  <li className="flex items-start gap-2">
                    <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>ارسال عادی فروشگاه · وابسته به سبد</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span>ارسال سریع · پس از ثبت سفارش</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* tabs */}
        <div className="mt-8 border-t border-[#e0e0e2] dark:border-white/10">
          <div className="sticky top-0 z-[5] flex gap-1 overflow-x-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            {(
              [
                { id: "desc" as const, label: "معرفی" },
                { id: "specs" as const, label: "مشخصات" },
                {
                  id: "reviews" as const,
                  label:
                    (product.commentCount ?? 0) > 0
                      ? `دیدگاه‌ها (${toPersianDigits(String(product.commentCount))})`
                      : "دیدگاه‌ها",
                },
              ]
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

          <div className="py-5 sm:py-6">
            {tab === "desc" ? (
              product.description?.trim() ? (
                <div className="w-full">
                  <div className="relative">
                    <div
                      className={cn(
                        "prose prose-sm dark:prose-invert max-w-none w-full leading-8 text-[#424750] dark:text-foreground",
                        !descExpanded && "max-h-[220px] overflow-hidden",
                      )}
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                    {!descExpanded ? (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
                      />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDescExpanded((v) => !v)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-md border border-[#e0e0e2] bg-background py-2.5 text-[13px] font-medium text-[#0c0c0c] hover:bg-[#fafafa] dark:border-white/10 dark:text-foreground dark:hover:bg-muted/40"
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
                <div className="max-w-3xl overflow-hidden rounded-md border border-[#e0e0e2] dark:border-white/10">
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
                          <th className="w-[36%] px-4 py-3 text-start font-medium text-[#81858b]">
                            {s.name}
                          </th>
                          <td className="px-4 py-3 text-[#0c0c0c] dark:text-foreground">
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
              ) : (
                <p className="text-sm text-muted-foreground">
                  مشخصاتی ثبت نشده است.
                </p>
              )
            ) : null}

            {tab === "reviews" ? (
              <div id="product-reviews" className="w-full">
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
    </div>
  );
}

const COLOR_MAP: Record<string, string> = {
  مشکی: "#111111",
  سیاه: "#111111",
  سفید: "#f5f5f5",
  قرمز: "#e11d48",
  آبی: "#2563eb",
  سبز: "#16a34a",
  زرد: "#eab308",
  نارنجی: "#f97316",
  صورتی: "#ec4899",
  بنفش: "#7c3aed",
  خاکستری: "#6b7280",
  طوسی: "#9ca3af",
  طلایی: "#ca8a04",
  نقره‌ای: "#a3a3a3",
  کرم: "#f5e6c8",
  قهوه‌ای: "#92400e",
};

function guessColor(label: string) {
  const key = Object.keys(COLOR_MAP).find((k) => label.includes(k));
  return key ? COLOR_MAP[key] : "#d4d4d8";
}

function isLightColor(label: string) {
  return /سفید|کرم|زرد|نقره/.test(label);
}
