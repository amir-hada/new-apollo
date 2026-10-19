"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { useShopSettings } from "@/lib/shop-settings-api";
import { formatPrice } from "@/lib/utils";
import type {
  Address,
  Cart,
  OrderDetail,
  StartPaymentResult,
  ValidateCouponResult,
} from "@/types/api";

function calcShipping(
  subtotalAfterDiscount: number,
  shippingEnabled: boolean | undefined,
  flatRate: number | undefined,
  freeThreshold: number | null | undefined,
) {
  if (!shippingEnabled) return 0;
  const rate = Math.max(0, flatRate ?? 0);
  if (rate <= 0) return 0;
  if (freeThreshold != null && freeThreshold > 0 && subtotalAfterDiscount >= freeThreshold) {
    return 0;
  }
  return rate;
}

function CheckoutContent() {
  const router = useRouter();
  const [addressId, setAddressId] = useState("");
  const [notes, setNotes] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResult | null>(null);

  const shopSettings = useShopSettings();

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get<Cart>("/api/cart")).data,
  });

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await api.get<Address[]>("/api/addresses")).data,
  });

  const applyCoupon = useMutation({
    mutationFn: async () => {
      const code = couponInput.trim();
      if (!code) throw new Error("کد تخفیف را وارد کنید");
      const subtotal = cartQuery.data?.subtotal ?? 0;
      const { data } = await api.post<ValidateCouponResult>("/api/coupons/validate", {
        code,
        subtotal,
      });
      return data;
    },
    onSuccess: (data) => {
      setAppliedCoupon(data);
      setCouponInput(data.code);
      toast.success(
        data.discountAmount > 0
          ? `کد ${data.code} اعمال شد`
          : `کد ${data.code} معتبر است`,
      );
    },
    onError: (err) => {
      setAppliedCoupon(null);
      toast.error(getApiErrorMessage(err));
    },
  });

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!addressId) throw new Error("آدرس را انتخاب کنید");
      const { data: order } = await api.post<OrderDetail>("/api/orders", {
        addressId,
        notes: notes || null,
        couponCode: appliedCoupon?.code || null,
      });
      const callbackUrl = `${window.location.origin}/account/orders/${order.id}`;
      const { data: payment } = await api.post<StartPaymentResult>("/api/payments/start", {
        orderId: order.id,
        callbackUrl,
      });
      return { order, payment };
    },
    onSuccess: ({ order, payment }) => {
      toast.success("سفارش ثبت شد");
      if (payment.redirectUrl) {
        window.location.href = payment.redirectUrl;
      } else {
        router.push(`/account/orders/${order.id}`);
      }
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const totals = useMemo(() => {
    const subtotal = cartQuery.data?.subtotal ?? 0;
    const discount = appliedCoupon?.discountAmount ?? 0;
    const afterDiscount = Math.max(0, subtotal - discount);
    const shipping = calcShipping(
      afterDiscount,
      shopSettings.data?.shippingEnabled,
      shopSettings.data?.flatShippingRate,
      shopSettings.data?.freeShippingThreshold,
    );
    return {
      subtotal,
      discount,
      shipping,
      grandTotal: afterDiscount + shipping,
    };
  }, [cartQuery.data?.subtotal, appliedCoupon, shopSettings.data]);

  if (cartQuery.isLoading || addressesQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (cartQuery.isError) {
    return <ErrorState message={getApiErrorMessage(cartQuery.error)} onRetry={() => cartQuery.refetch()} />;
  }

  const cart = cartQuery.data!;
  if (!cart.items.length) {
    return (
      <EmptyState
        title="سبد خرید خالی است"
        action={
          <Link href="/products">
            <Button>بازگشت به فروشگاه</Button>
          </Link>
        }
      />
    );
  }

  const addresses = addressesQuery.data || [];
  const freeThreshold = shopSettings.data?.freeShippingThreshold;
  const shippingNote = shopSettings.data?.shippingCustomerNote;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">تسویه حساب</h1>
        <div className="rounded-xl border border-border p-4">
          <Label>آدرس ارسال</Label>
          {addresses.length === 0 ? (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-muted-foreground">آدرسی ثبت نشده است.</p>
              <Link href="/account/addresses">
                <Button variant="outline">افزودن آدرس</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className="flex cursor-pointer gap-3 rounded-lg border border-border p-3 has-[:checked]:border-primary"
                >
                  <input
                    type="radio"
                    name="address"
                    value={a.id}
                    checked={addressId === a.id}
                    onChange={() => setAddressId(a.id)}
                  />
                  <span className="text-sm leading-6">
                    <strong>{a.title}</strong> — {a.fullName}
                    <br />
                    {a.province}، {a.city}، {a.line1}
                    {a.line2 ? `، ${a.line2}` : ""}
                    <br />
                    {a.phone} · {a.postalCode}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="notes">یادداشت سفارش</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <aside className="h-fit rounded-xl border border-border p-4 space-y-3">
        <p className="font-semibold">خلاصه سفارش</p>
        {cart.items.map((i) => (
          <div key={i.id} className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {i.productName} × {i.quantity}
            </span>
            <span>{formatPrice(i.lineTotal)}</span>
          </div>
        ))}

        <div className="space-y-2 border-t border-border pt-3">
          <Label htmlFor="coupon">کد تخفیف</Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              dir="ltr"
              className="uppercase"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value);
                if (appliedCoupon) setAppliedCoupon(null);
              }}
              placeholder="مثلاً SUMMER20"
            />
            <Button
              type="button"
              variant="outline"
              disabled={applyCoupon.isPending || !couponInput.trim()}
              onClick={() => applyCoupon.mutate()}
            >
              {applyCoupon.isPending ? "..." : "اعمال"}
            </Button>
          </div>
          {appliedCoupon ? (
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              کد {appliedCoupon.code} اعمال شد
              {appliedCoupon.discountAmount > 0
                ? ` (−${formatPrice(appliedCoupon.discountAmount)})`
                : ""}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">جمع جزء</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 ? (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
              <span>تخفیف</span>
              <span>−{formatPrice(totals.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-muted-foreground">هزینه ارسال</span>
            <span>
              {totals.shipping > 0 ? formatPrice(totals.shipping) : "رایگان"}
            </span>
          </div>
          {shippingNote ? (
            <p className="text-xs leading-5 text-muted-foreground">{shippingNote}</p>
          ) : freeThreshold != null && freeThreshold > 0 ? (
            <p className="text-xs text-muted-foreground">
              ارسال رایگان برای خرید بالای {formatPrice(freeThreshold)}
            </p>
          ) : null}
          <div className="flex justify-between border-t border-border pt-2 font-bold">
            <span>مبلغ قابل پرداخت</span>
            <span>{formatPrice(totals.grandTotal)}</span>
          </div>
        </div>
        <Button
          className="w-full"
          disabled={!addressId || placeOrder.isPending}
          onClick={() => placeOrder.mutate()}
        >
          {placeOrder.isPending ? "در حال ثبت..." : "ثبت سفارش و پرداخت"}
        </Button>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <AuthGuard>
        <CheckoutContent />
      </AuthGuard>
    </div>
  );
}
