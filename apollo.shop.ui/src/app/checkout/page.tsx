"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Address, Cart, OrderDetail, StartPaymentResult } from "@/types/api";

function CheckoutContent() {
  const router = useRouter();
  const [addressId, setAddressId] = useState("");
  const [notes, setNotes] = useState("");

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get<Cart>("/api/cart")).data,
  });

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await api.get<Address[]>("/api/addresses")).data,
  });

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!addressId) throw new Error("آدرس را انتخاب کنید");
      const { data: order } = await api.post<OrderDetail>("/api/orders", {
        addressId,
        notes: notes || null,
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
        <div className="border-t border-border pt-3 flex justify-between font-bold">
          <span>جمع</span>
          <span>{formatPrice(cart.subtotal)}</span>
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
