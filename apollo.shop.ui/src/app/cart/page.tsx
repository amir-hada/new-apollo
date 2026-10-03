"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Skeleton } from "@/components/ui/skeleton";
import { api, getApiErrorMessage } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import type { Cart } from "@/types/api";

export default function CartPage() {
  const setCart = useCartStore((s) => s.setCart);
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get<Cart>("/api/cart")).data,
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) =>
      (await api.put<Cart>(`/api/cart/items/${id}`, { quantity })).data,
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(["cart"], cart);
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => (await api.delete<Cart>(`/api/cart/items/${id}`)).data,
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(["cart"], cart);
      toast.success("حذف شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  if (cartQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (cartQuery.isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <ErrorState message={getApiErrorMessage(cartQuery.error)} onRetry={() => cartQuery.refetch()} />
      </div>
    );
  }

  const cart = cartQuery.data!;

  if (!cart.items.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <EmptyState
          title="سبد خرید خالی است"
          description="محصولی به سبد اضافه نکرده‌اید."
          action={
            <Link href="/products">
              <Button>مشاهده محصولات</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">سبد خرید</h1>
      <div className="space-y-3">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <Link href={`/products/${item.productSlug}`} className="font-medium hover:text-primary">
                {item.productName}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.variantName} · {item.sku}
              </p>
              {(item.selectedOptions?.length ?? 0) > 0 ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.selectedOptions
                    .map((o) => `${o.name}: ${o.value}`)
                    .join(" · ")}
                </p>
              ) : null}
              <p className="mt-2 text-sm">{formatPrice(item.unitPrice)}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={item.stockQuantity}
                defaultValue={item.quantity}
                className="h-10 w-20 rounded-lg border border-border bg-background px-2 text-sm"
                onBlur={(e) => {
                  const quantity = Number(e.target.value) || 1;
                  if (quantity !== item.quantity) updateItem.mutate({ id: item.id, quantity });
                }}
              />
              <p className="min-w-24 text-sm font-semibold">{formatPrice(item.lineTotal)}</p>
              <Button variant="ghost" size="sm" onClick={() => removeItem.mutate(item.id)}>
                حذف
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-end gap-3 rounded-xl border border-border p-4">
        <p className="text-lg font-bold">جمع: {formatPrice(cart.subtotal)}</p>
        <Link href="/checkout">
          <Button size="lg">ادامه و تسویه حساب</Button>
        </Link>
      </div>
    </div>
  );
}
