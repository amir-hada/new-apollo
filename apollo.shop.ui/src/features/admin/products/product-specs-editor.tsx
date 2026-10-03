"use client";

import { useState } from "react";
import {
  ChevronDown,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingField } from "@/components/ui/floating-field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatGroupedPersianDigits,
  normalizeDigits,
  toPersianDigits,
} from "@/features/auth/normalize-phone";
import { priceToPersianWords } from "@/lib/persian-number-words";
import { cn } from "@/lib/utils";
import { useShopCurrency } from "@/providers/ShopCurrencyProvider";
import type { ProductSpec, ProductSpecValue } from "@/types/api";

function Hint({ text }: { text: string }) {
  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          type="button"
          className={cn(
            "inline-flex size-3.5 shrink-0 items-center justify-center rounded-full",
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
          className="max-w-[18rem] px-3 py-2 text-start text-[11px] leading-5 font-normal"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function emptyValue(sortOrder: number): ProductSpecValue {
  return {
    id: null,
    value: "",
    priceAdjustment: 0,
    sortOrder,
  };
}

export function emptySpec(sortOrder: number): ProductSpec {
  return {
    id: null,
    name: "",
    isOrderParameter: false,
    sortOrder,
    values: [emptyValue(1)],
  };
}

function formatAdjustmentInput(adj: number) {
  const n = Math.trunc(adj || 0);
  if (n === 0) return "";
  const abs = formatGroupedPersianDigits(String(Math.abs(n)));
  return n < 0 ? `-${abs}` : abs;
}

function adjustmentWords(adj: number, currency: string) {
  const n = Math.trunc(adj || 0);
  if (n === 0) return "";
  const words = priceToPersianWords(Math.abs(n), currency);
  if (!words) return "";
  return n > 0 ? `افزایش ${words}` : `کاهش ${words}`;
}

type ProductSpecsEditorProps = {
  specs: ProductSpec[];
  onChange: (specs: ProductSpec[]) => void;
};

export function ProductSpecsEditor({
  specs,
  onChange,
}: ProductSpecsEditorProps) {
  const shopCurrency = useShopCurrency();
  const [openIndex, setOpenIndex] = useState<number | null>(
    specs.length > 0 ? 0 : null,
  );

  const updateSpec = (index: number, patch: Partial<ProductSpec>) => {
    onChange(specs.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const updateValue = (
    specIndex: number,
    valueIndex: number,
    patch: Partial<ProductSpecValue>,
  ) => {
    const spec = specs[specIndex];
    if (!spec) return;
    updateSpec(specIndex, {
      values: spec.values.map((v, i) =>
        i === valueIndex ? { ...v, ...patch } : v,
      ),
    });
  };

  const addSpec = () => {
    const next = [...specs, emptySpec(specs.length + 1)];
    onChange(next);
    setOpenIndex(next.length - 1);
  };

  const removeSpec = (index: number) => {
    const next = specs.filter((_, i) => i !== index);
    onChange(next);
    setOpenIndex((prev) => {
      if (next.length === 0) return null;
      if (prev == null) return 0;
      if (prev === index) return Math.min(index, next.length - 1);
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-2">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pe-0.5 pb-2">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-0.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              ویژگی‌های محصول
            </p>
            <Hint text="هر ویژگی می‌تواند چند مقدار داشته باشد (مثل رنگ: مشکی، سفید). اگر پارامتر سفارش روشن باشد، خریدار یکی از مقادیر را هنگام خرید انتخاب می‌کند." />
            {specs.length > 0 ? (
              <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                {toPersianDigits(String(specs.length))} مورد
              </span>
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            className="h-9 shrink-0 touch-manipulation gap-1.5 sm:h-8"
            onClick={addSpec}
          >
            <Plus className="size-3.5" />
            <span className="max-sm:hidden">افزودن ویژگی</span>
            <span className="sm:hidden">افزودن</span>
          </Button>
        </div>

        {specs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-card/40 px-6 py-14 text-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-muted/50">
              <ListChecks className="size-5 text-muted-foreground/70" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">هنوز ویژگی‌ای ثبت نشده</p>
              <p className="max-w-sm text-xs text-pretty text-muted-foreground">
                مواردی مثل رنگ، حجم یا حافظه را اضافه کنید تا در صفحه محصول
                نمایش داده شوند.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={addSpec}
            >
              <Plus className="size-3.5" />
              افزودن اولین ویژگی
            </Button>
          </div>
        ) : (
          specs.map((spec, index) => {
            const open = openIndex === index;
            const title =
              spec.name.trim() ||
              `ویژگی ${toPersianDigits(String(index + 1))}`;
            const multi = spec.values.length >= 2;
            const orderEnabled = multi && spec.isOrderParameter;
            const filledCount = spec.values.filter((v) =>
              v.value.trim(),
            ).length;

            return (
              <div
                key={`${spec.id ?? "new"}-${index}`}
                className="overflow-hidden rounded-xl border border-border/80 bg-card/40"
              >
                <div className="flex items-center gap-1 p-1.5 sm:p-2">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-start transition-colors hover:bg-muted/40"
                    onClick={() =>
                      setOpenIndex((prev) => (prev === index ? null : index))
                    }
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        open ? "rotate-0" : "-rotate-90",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {toPersianDigits(String(filledCount))} مقدار
                        {orderEnabled ? " · پارامتر سفارش" : ""}
                      </p>
                    </div>
                  </button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="حذف ویژگی"
                    onClick={() => removeSpec(index)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                {open ? (
                  <div className="space-y-3 border-t border-border/60 p-2.5 sm:p-3">
                    <div className="grid content-start gap-3 sm:grid-cols-2">
                      <FloatingField
                        label="عنوان ویژگی"
                        required
                        value={spec.name}
                        onChange={(value) =>
                          updateSpec(index, { name: value })
                        }
                        hint="مثلاً رنگ، حجم، حافظه"
                        surfaceClassName="bg-card"
                      />
                      <div className="flex flex-col gap-2.5 px-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <div className="flex min-w-0 items-start gap-1.5">
                          <div className="min-w-0">
                            <Label
                              className={cn(
                                "text-sm",
                                !multi && "text-muted-foreground",
                              )}
                            >
                              پارامتر سفارش
                            </Label>
                            <p className="text-xs text-pretty text-muted-foreground">
                              {multi
                                ? "خریدار یکی از مقادیر را انتخاب می‌کند"
                                : "حداقل ۲ مقدار لازم است"}
                            </p>
                          </div>
                          <Hint text="با حداقل دو مقدار فعال می‌شود. خریدار یکی را انتخاب می‌کند و می‌توانید برای هر مقدار تغییر قیمت جداگانه بگذارید." />
                        </div>
                        <Switch
                          className="self-end sm:self-auto"
                          checked={orderEnabled}
                          disabled={!multi}
                          onCheckedChange={(checked) =>
                            updateSpec(index, {
                              isOrderParameter: checked,
                              values: spec.values.map((v) => ({
                                ...v,
                                priceAdjustment: checked
                                  ? v.priceAdjustment
                                  : 0,
                              })),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="px-0.5 text-[11px] font-medium text-muted-foreground">
                        مقادیر
                      </p>
                      <div className="space-y-2.5">
                        {spec.values.map((val, valueIndex) => {
                          const adj = Math.trunc(val.priceAdjustment || 0);
                          const words = orderEnabled
                            ? adjustmentWords(adj, shopCurrency)
                            : "";

                          return (
                            <div
                              key={`${val.id ?? "v"}-${valueIndex}`}
                              className={cn(
                                "grid items-start gap-2",
                                orderEnabled
                                  ? "grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]"
                                  : "grid-cols-[minmax(0,1fr)_auto]",
                              )}
                            >
                              <FloatingField
                                label={`مقدار ${toPersianDigits(String(valueIndex + 1))}`}
                                value={val.value}
                                onChange={(value) =>
                                  updateValue(index, valueIndex, { value })
                                }
                                surfaceClassName="bg-card"
                                className={orderEnabled ? "col-span-1 sm:col-auto" : undefined}
                              />

                              {orderEnabled ? (
                                <div className="col-span-2 space-y-1 sm:col-span-1 sm:col-auto">
                                  <FloatingField
                                    label="تغییر قیمت"
                                    dir="ltr"
                                    value={formatAdjustmentInput(adj)}
                                    onChange={(raw) => {
                                      const trimmed = raw.trim();
                                      const negative =
                                        trimmed.startsWith("-") ||
                                        trimmed.startsWith("−");
                                      const digits = normalizeDigits(
                                        trimmed.replace(/^[-−]/, ""),
                                      );
                                      const n = digits ? Number(digits) : 0;
                                      updateValue(index, valueIndex, {
                                        priceAdjustment: negative ? -n : n,
                                      });
                                    }}
                                    hint="مثبت = افزایش، منفی = کاهش نسبت به قیمت پایه"
                                    surfaceClassName="bg-card"
                                  />
                                  <p
                                    className={cn(
                                      "min-h-4 px-1 text-[11px] leading-4 text-pretty break-words",
                                      words
                                        ? adj > 0
                                          ? "text-emerald-700 dark:text-emerald-400"
                                          : "text-rose-700 dark:text-rose-400"
                                        : "text-muted-foreground/60",
                                    )}
                                  >
                                    {words || "بدون تغییر قیمت"}
                                  </p>
                                </div>
                              ) : null}

                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className={cn(
                                  "size-11 shrink-0 touch-manipulation text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                                  orderEnabled
                                    ? "row-start-1 justify-self-end sm:row-auto sm:justify-self-auto"
                                    : "mt-0",
                                )}
                                disabled={spec.values.length <= 1}
                                title="حذف مقدار"
                                onClick={() => {
                                  const values = spec.values.filter(
                                    (_, i) => i !== valueIndex,
                                  );
                                  updateSpec(index, {
                                    values,
                                    isOrderParameter:
                                      values.length >= 2
                                        ? spec.isOrderParameter
                                        : false,
                                  });
                                }}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 border-dashed"
                        onClick={() =>
                          updateSpec(index, {
                            values: [
                              ...spec.values,
                              emptyValue(spec.values.length + 1),
                            ],
                          })
                        }
                      >
                        <Plus className="size-3.5" />
                        مقدار جدید
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
