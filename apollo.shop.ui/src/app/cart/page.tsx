"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/skeleton";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { resolveProductImageUrl } from "@/lib/product-image";
import {
  formatPrice,
  normalizeShopCurrency,
  toDisplayAmount,
} from "@/lib/shop-currency";
import { useShopCurrency } from "@/providers/ShopCurrencyProvider";
import type { Cart } from "@/types/api";

function formatAmountFa(valueInToman: number, currency: string) {
  return toPersianDigits(
    new Intl.NumberFormat("fa-IR").format(
      toDisplayAmount(valueInToman, normalizeShopCurrency(currency)),
    ),
  );
}

export default function CartPage() {
  const setCart = useCartStore((s) => s.setCart);
  const queryClient = useQueryClient();
  const currency = useShopCurrency() || "تومان";

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get<Cart>("/api/cart")).data,
  });

  const syncCart = (cart: Cart) => {
    setCart(cart);
    queryClient.setQueryData(["cart"], cart);
  };

  const updateItem = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) =>
      (await api.put<Cart>(`/api/cart/items/${id}`, { quantity })).data,
    onSuccess: syncCart,
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) =>
      (await api.delete<Cart>(`/api/cart/items/${id}`)).data,
    onSuccess: (cart) => {
      syncCart(cart);
      toast.success("از سبد حذف شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (cartQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1100px] space-y-3 px-3 py-8 sm:px-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className="mx-auto max-w-[1100px] px-3 py-10 sm:px-4">
        <ErrorState
          message={getApiErrorMessage(cartQuery.error)}
          onRetry={() => cartQuery.refetch()}
        />
      </div>
    );
  }

  const cart = cartQuery.data!;
  const busy = updateItem.isPending || removeItem.isPending;

  if (!cart.items.length) {
    return (
      <div className="mx-auto max-w-[1100px] px-3 py-10 sm:px-4">
        <EmptyState
          title="سبد خرید شما خالی است!"
          description="می‌توانید برای مشاهده محصولات بیشتر به صفحه اصلی بروید."
          action={
            <Link href="/products">
              <Button className="rounded-md">مشاهده محصولات</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-[#f5f5f5] dark:bg-background">
      <div className="mx-auto grid w-full max-w-[1100px] gap-4 px-3 py-6 sm:px-4 lg:grid-cols-[1fr_300px] lg:py-8">
        <section className="min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-md border border-[#e0e0e2] bg-background px-4 py-3 dark:border-white/10">
            <h1 className="text-[16px] font-bold text-[#0c0c0c] dark:text-foreground">
              سبد خرید
              <span className="ms-2 text-[13px] font-normal text-[#81858b]">
                ({toPersianDigits(String(cart.itemCount))} کالا)
              </span>
            </h1>
            <ShoppingBag className="size-5 text-[#a1a3a8]" />
          </div>

          {cart.items.map((item) => (
            <article
              key={item.id}
              className="rounded-md border border-[#e0e0e2] bg-background p-4 dark:border-white/10"
            >
              <div className="flex gap-3 sm:gap-4">
                <Link
                  href={`/products/${item.productSlug}`}
                  className="size-24 shrink-0 overflow-hidden rounded-md border border-[#f0f0f1] bg-background sm:size-28 dark:border-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveProductImageUrl(null)}
                    alt=""
                    className="size-full object-contain p-1.5"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="line-clamp-2 text-[13px] font-bold leading-6 text-[#0c0c0c] hover:text-primary dark:text-foreground"
                  >
                    {item.productName}
                  </Link>
                  {(item.selectedOptions?.length ?? 0) > 0 ? (
                    <p className="mt-1 text-[12px] text-[#81858b]">
                      {item.selectedOptions
                        .map((o) => `${o.name}: ${o.value}`)
                        .join(" · ")}
                    </p>
                  ) : (
                    <p className="mt-1 text-[12px] text-[#81858b]">
                      {item.variantName}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-[#a1a3a8]">
                    گارانتی اصالت و سلامت فیزیکی کالا
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex h-10 items-center gap-0.5 rounded-md border border-[#e0e0e2] bg-background px-0.5 shadow-sm dark:border-white/10">
                      <button
                        type="button"
                        aria-label="افزایش"
                        disabled={
                          busy || item.quantity >= Math.max(1, item.stockQuantity)
                        }
                        onClick={() =>
                          updateItem.mutate({
                            id: item.id,
                            quantity: item.quantity + 1,
                          })
                        }
                        className="inline-flex size-9 items-center justify-center text-primary disabled:opacity-40"
                      >
                        <Plus className="size-4" strokeWidth={2.5} />
                      </button>
                      <span className="min-w-7 text-center text-[13px] font-bold text-primary">
                        {toPersianDigits(String(item.quantity))}
                      </span>
                      {item.quantity <= 1 ? (
                        <button
                          type="button"
                          aria-label="حذف"
                          disabled={busy}
                          onClick={() => removeItem.mutate(item.id)}
                          className="inline-flex size-9 items-center justify-center text-primary disabled:opacity-40"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          aria-label="کاهش"
                          disabled={busy}
                          onClick={() =>
                            updateItem.mutate({
                              id: item.id,
                              quantity: item.quantity - 1,
                            })
                          }
                          className="inline-flex size-9 items-center justify-center text-primary disabled:opacity-40"
                        >
                          <Minus className="size-4" strokeWidth={2.5} />
                        </button>
                      )}
                    </div>

                    <div className="text-end">
                      <p className="text-[16px] font-black text-[#0c0c0c] dark:text-foreground">
                        {formatAmountFa(item.lineTotal, currency)}
                        <span className="ms-1 text-[11px] font-medium text-[#81858b]">
                          {currency}
                        </span>
                      </p>
                      {item.quantity > 1 ? (
                        <p className="mt-0.5 text-[11px] text-[#a1a3a8]">
                          هر عدد {formatAmountFa(item.unitPrice, currency)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit lg:sticky lg:top-24">
          <div className="rounded-md border border-[#e0e0e2] bg-background p-4 dark:border-white/10">
            <div className="mb-4 flex items-center justify-between gap-3 text-[13px]">
              <span className="text-[#81858b]">
                قیمت کالاها ({toPersianDigits(String(cart.itemCount))})
              </span>
              <span className="font-bold text-[#0c0c0c] dark:text-foreground">
                {formatPrice(cart.subtotal, currency)}
              </span>
            </div>
            <div className="mb-4 flex items-center justify-between gap-3 border-t border-[#f0f0f1] pt-4 text-[14px] dark:border-white/10">
              <span className="font-bold text-[#0c0c0c] dark:text-foreground">
                جمع سبد خرید
              </span>
              <span className="text-[18px] font-black text-[#0c0c0c] dark:text-foreground">
                {formatPrice(cart.subtotal, currency)}
              </span>
            </div>
            <p className="mb-4 text-[11px] leading-5 text-[#81858b]">
              هزینه‌ی ارسال در ادامه بر اساس آدرس، زمان و نحوه‌ی ارسال محاسبه
              می‌شود.
            </p>
            <Link href="/checkout" className="block">
              <Button className="h-12 w-full rounded-md text-[14px] font-bold">
                تایید و تکمیل سفارش
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
