"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { getProductDisplayPrices } from "@/lib/product-price";
import { formatPrice } from "@/lib/utils";
import type { Cart, ProductDetail, ProductSpec } from "@/types/api";

function shouldShowRemainingStock(product: ProductDetail) {
  if (!product.trackInventory || !product.showStockInStore) return false;
  if (product.stockDisplayThreshold == null) return true;
  return product.stockQuantity <= product.stockDisplayThreshold;
}

function orderParamSpecs(product: ProductDetail): ProductSpec[] {
  return (product.specs ?? []).filter(
    (s) => s.isOrderParameter && (s.values?.length ?? 0) >= 2,
  );
}

export function AddToCartForm({ product }: { product: ProductDetail }) {
  const activeVariants = useMemo(
    () => product.variants.filter((v) => v.isActive),
    [product.variants],
  );
  const selected = activeVariants[0];
  const params = useMemo(() => orderParamSpecs(product), [product]);
  const { current } = getProductDisplayPrices(product);

  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const spec of orderParamSpecs(product)) {
      const first = spec.values[0];
      if (spec.id && first?.id) initial[spec.id] = first.id;
    }
    setSelections(initial);
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

  const [quantity, setQuantity] = useState(minQty);
  const setCart = useCartStore((s) => s.setCart);
  const queryClient = useQueryClient();

  useEffect(() => {
    setQuantity(minQty);
  }, [minQty, product.id]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selected?.id) throw new Error("محصول قابل سفارش نیست");
      for (const spec of params) {
        if (!spec.id || !selections[spec.id]) {
          throw new Error(`لطفاً «${spec.name}» را انتخاب کنید`);
        }
      }
      const { data } = await api.post<Cart>("/api/cart/items", {
        productVariantId: selected.id,
        quantity,
        selectedSpecValueIds: selectedValueIds,
      });
      return data;
    },
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(["cart"], cart);
      toast.success("به سبد خرید اضافه شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const remaining = selected?.stockQuantity ?? product.stockQuantity;
  const inStock = Boolean(selected) && (!track || remaining > 0);
  const canPurchase = product.isAvailable && inStock;
  const showRemaining = shouldShowRemainingStock(product);

  if (!canPurchase) {
    return (
      <div className="space-y-4 rounded-xl border border-border p-4">
        <Button className="w-full" disabled variant="secondary">
          ناموجود
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      {params.map((spec) => (
        <div key={spec.id ?? spec.name} className="space-y-2">
          <Label>{spec.name}</Label>
          <div className="flex flex-wrap gap-2">
            {spec.values.map((v) => {
              if (!spec.id || !v.id) return null;
              const active = selections[spec.id] === v.id;
              const delta = v.priceAdjustment || 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() =>
                    setSelections((prev) => ({ ...prev, [spec.id!]: v.id! }))
                  }
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <span>{v.value}</span>
                  {delta !== 0 ? (
                    <span className="ms-2 text-xs text-muted-foreground">
                      {delta > 0 ? "+" : ""}
                      {formatPrice(delta)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {adjustment !== 0 ? (
        <p className="text-sm text-muted-foreground">
          قیمت نهایی با گزینه‌ها:{" "}
          <span className="font-semibold text-foreground">
            {formatPrice(unitPrice)}
          </span>
        </p>
      ) : null}

      <div>
        <Label htmlFor="qty">تعداد</Label>
        <input
          id="qty"
          type="number"
          min={minQty}
          max={maxQty ?? undefined}
          value={quantity}
          onChange={(e) => {
            const next = Number(e.target.value) || minQty;
            const clamped =
              maxQty != null
                ? Math.min(Math.max(next, minQty), maxQty)
                : Math.max(next, minQty);
            setQuantity(clamped);
          }}
          className="flex h-10 w-28 rounded-lg border border-border bg-background px-3 text-sm"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {track ? (
            <>
              حداقل {toPersianDigits(String(minQty))}
              {maxFromProduct != null
                ? ` · حداکثر ${toPersianDigits(String(maxFromProduct))}`
                : ""}
            </>
          ) : (
            "بدون محدودیت موجودی"
          )}
        </p>
        {showRemaining ? (
          <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            {toPersianDigits(String(Math.max(0, remaining)))} عدد باقی مانده
          </p>
        ) : null}
      </div>
      <Button
        className="w-full"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? "در حال افزودن..." : "افزودن به سبد خرید"}
      </Button>
    </div>
  );
}
