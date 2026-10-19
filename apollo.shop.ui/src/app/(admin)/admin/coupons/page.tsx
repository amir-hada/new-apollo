"use client";

import { FormEvent, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api, getApiErrorMessage } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Coupon } from "@/types/api";

const COUPONS_QUERY_KEY = ["admin-coupons"] as const;

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("");
  const [amountOff, setAmountOff] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [isActive, setIsActive] = useState(true);

  const coupons = useQuery({
    queryKey: COUPONS_QUERY_KEY,
    queryFn: async () => (await api.get<Coupon[]>("/api/admin/coupons")).data,
  });

  const activeCount = useMemo(
    () => (coupons.data ?? []).filter((c) => c.isActive).length,
    [coupons.data],
  );

  const createCoupon = useMutation({
    mutationFn: async () => {
      const normalized = code.trim().toUpperCase();
      if (!normalized) throw new Error("کد تخفیف را وارد کنید");
      if (!percentOff.trim() && !amountOff.trim()) {
        throw new Error("درصد یا مبلغ تخفیف را مشخص کنید");
      }
      const { data } = await api.post<Coupon>("/api/admin/coupons", {
        code: normalized,
        percentOff: percentOff.trim() ? Number(percentOff) : null,
        amountOff: amountOff.trim() ? Number(amountOff) : null,
        isActive,
        maxUses: maxUses.trim() ? Number(maxUses) : null,
        startsAtUtc: null,
        endsAtUtc: null,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      setCode("");
      setPercentOff("");
      setAmountOff("");
      setMaxUses("");
      setIsActive(true);
      toast.success("کد تخفیف اضافه شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: boolean }) =>
      (await api.put<Coupon>(`/api/admin/coupons/${id}/active`, { isActive: next })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      toast.success("کد حذف شد");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    createCoupon.mutate();
  }

  const items = coupons.data ?? [];

  return (
    <div className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="grid gap-3 rounded-xl border border-border/80 p-3 sm:grid-cols-2 lg:grid-cols-6"
      >
        <div className="space-y-1 lg:col-span-2">
          <Label className="text-xs text-muted-foreground">کد تخفیف</Label>
          <Input
            dir="ltr"
            className="h-9 uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="SUMMER20"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">درصد تخفیف</Label>
          <Input
            dir="ltr"
            className="h-9"
            inputMode="numeric"
            value={percentOff}
            onChange={(e) => setPercentOff(e.target.value)}
            placeholder="20"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">مبلغ تخفیف</Label>
          <Input
            dir="ltr"
            className="h-9"
            inputMode="numeric"
            value={amountOff}
            onChange={(e) => setAmountOff(e.target.value)}
            placeholder="50000"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">سقف استفاده</Label>
          <Input
            dir="ltr"
            className="h-9"
            inputMode="numeric"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="۱۰۰"
          />
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-center gap-2 pb-1">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label className="text-sm font-normal">فعال</Label>
          </div>
          <Button type="submit" className="h-9" disabled={createCoupon.isPending}>
            {createCoupon.isPending ? "..." : "افزودن"}
          </Button>
        </div>
      </form>

      {coupons.isLoading && <Skeleton className="h-40 w-full" />}
      {coupons.isError && (
        <ErrorState
          message={getApiErrorMessage(coupons.error)}
          onRetry={() => coupons.refetch()}
        />
      )}

      {!coupons.isLoading && !coupons.isError ? (
        <p className="text-xs text-muted-foreground">
          {toPersianDigits(String(items.length))} کد ·{" "}
          {toPersianDigits(String(activeCount))} فعال
        </p>
      ) : null}

      {!coupons.isLoading && !coupons.isError && items.length === 0 ? (
        <EmptyState
          title="کد تخفیفی ثبت نشده"
          description="اولین کد تخفیف فروشگاه را از فرم بالا اضافه کنید."
        />
      ) : null}

      {items.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کد</TableHead>
                <TableHead>درصد</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>سقف / استفاده</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium" dir="ltr">
                    {c.code}
                  </TableCell>
                  <TableCell>
                    {c.percentOff != null
                      ? `${toPersianDigits(String(c.percentOff))}٪`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {c.amountOff != null ? formatPrice(c.amountOff) : "—"}
                  </TableCell>
                  <TableCell>
                    {toPersianDigits(String(c.usedCount))}
                    {" / "}
                    {c.maxUses != null ? toPersianDigits(String(c.maxUses)) : "∞"}
                  </TableCell>
                  <TableCell>{c.isActive ? "فعال" : "غیرفعال"}</TableCell>
                  <TableCell className="text-end">
                    <div className="inline-flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={toggleActive.isPending}
                        onClick={() =>
                          toggleActive.mutate({ id: c.id, next: !c.isActive })
                        }
                      >
                        {c.isActive ? "غیرفعال" : "فعال"}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        disabled={deleteCoupon.isPending}
                        onClick={() => deleteCoupon.mutate(c.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
