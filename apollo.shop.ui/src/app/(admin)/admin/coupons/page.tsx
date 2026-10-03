"use client";

import { FormEvent, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { formatPrice } from "@/lib/utils";

type LocalCoupon = {
  id: string;
  code: string;
  percentOff: string;
  amountOff: string;
  isActive: boolean;
  maxUses: string;
};

const STORAGE_KEY = "apolloshop.admin-coupons";

function loadCoupons(): LocalCoupon[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalCoupon[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCoupons(items: LocalCoupon[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function AdminCouponsPage() {
  const [items, setItems] = useState<LocalCoupon[]>(() => loadCoupons());
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState("");
  const [amountOff, setAmountOff] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [isActive, setIsActive] = useState(true);

  const activeCount = useMemo(
    () => items.filter((c) => c.isActive).length,
    [items],
  );

  function persist(next: LocalCoupon[]) {
    setItems(next);
    saveCoupons(next);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      toast.error("کد تخفیف را وارد کنید");
      return;
    }
    if (items.some((c) => c.code === normalized)) {
      toast.error("این کد قبلاً ثبت شده است");
      return;
    }
    if (!percentOff.trim() && !amountOff.trim()) {
      toast.error("درصد یا مبلغ تخفیف را مشخص کنید");
      return;
    }

    const next: LocalCoupon[] = [
      {
        id: crypto.randomUUID(),
        code: normalized,
        percentOff: percentOff.trim(),
        amountOff: amountOff.trim(),
        maxUses: maxUses.trim(),
        isActive,
      },
      ...items,
    ];
    persist(next);
    setCode("");
    setPercentOff("");
    setAmountOff("");
    setMaxUses("");
    setIsActive(true);
    toast.success("کد تخفیف اضافه شد");
  }

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
          <Button type="submit" className="h-9">
            افزودن
          </Button>
        </div>
      </form>

      <p className="text-xs text-muted-foreground">
        {toPersianDigits(String(items.length))} کد ·{" "}
        {toPersianDigits(String(activeCount))} فعال
      </p>

      {items.length === 0 ? (
        <EmptyState
          title="کد تخفیفی ثبت نشده"
          description="اولین کد تخفیف فروشگاه را از فرم بالا اضافه کنید."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کد</TableHead>
                <TableHead>درصد</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>سقف</TableHead>
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
                    {c.percentOff
                      ? `${toPersianDigits(c.percentOff)}٪`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {c.amountOff ? formatPrice(Number(c.amountOff) || 0) : "—"}
                  </TableCell>
                  <TableCell>
                    {c.maxUses ? toPersianDigits(c.maxUses) : "نامحدود"}
                  </TableCell>
                  <TableCell>{c.isActive ? "فعال" : "غیرفعال"}</TableCell>
                  <TableCell className="text-end">
                    <div className="inline-flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          persist(
                            items.map((x) =>
                              x.id === c.id
                                ? { ...x, isActive: !x.isActive }
                                : x,
                            ),
                          )
                        }
                      >
                        {c.isActive ? "غیرفعال" : "فعال"}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => {
                          persist(items.filter((x) => x.id !== c.id));
                          toast.success("کد حذف شد");
                        }}
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
      )}
    </div>
  );
}
