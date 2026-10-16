"use client";

import { useEffect, useState } from "react";
import { ListChecks, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  formatGroupedPersianDigits,
  normalizeDigits,
  toPersianDigits,
} from "@/features/auth/normalize-phone";
import {
  getIndustrySpecTemplates,
  type IndustrySpecTemplate,
} from "@/lib/shop-industry-presets";
import {
  looksLikeColorSpec,
  resolveSwatchColor,
  suggestColorHex,
} from "@/lib/product-color";
import { useShopSettings } from "@/lib/shop-settings-api";
import { cn } from "@/lib/utils";
import type { ProductSpec, ProductSpecValue } from "@/types/api";

function emptyValue(
  sortOrder: number,
  value = "",
  colorHex: string | null = null,
): ProductSpecValue {
  return { id: null, value, priceAdjustment: 0, sortOrder, colorHex };
}

export function emptySpec(sortOrder: number): ProductSpec {
  return {
    id: null,
    name: "",
    isOrderParameter: false,
    sortOrder,
    values: [],
  };
}

function specFromTemplate(
  template: IndustrySpecTemplate,
  sortOrder: number,
): ProductSpec {
  const samples = (template.sampleValues ?? []).filter((v) => v.trim());
  const values =
    samples.length > 0
      ? samples.map((value, i) => emptyValue(i + 1, value))
      : [];
  const canOrder = template.isOrderParameter && values.length >= 2;
  return {
    id: null,
    name: template.name,
    isOrderParameter: canOrder,
    sortOrder,
    values,
  };
}

function formatAdj(adj: number) {
  const n = Math.trunc(adj || 0);
  if (n === 0) return "";
  const abs = formatGroupedPersianDigits(String(Math.abs(n)));
  return n < 0 ? `-${abs}` : abs;
}

function parseAdj(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  const negative = trimmed.startsWith("-") || trimmed.startsWith("−");
  const digits = normalizeDigits(trimmed.replace(/^[-−]/, ""));
  const n = digits ? Number(digits) : 0;
  return negative ? -n : n;
}

function filledCount(spec: ProductSpec) {
  return spec.values.filter((v) => v.value.trim()).length;
}

type ProductSpecsEditorProps = {
  specs: ProductSpec[];
  onChange: (specs: ProductSpec[]) => void;
  compact?: boolean;
};

export function ProductSpecsEditor({
  specs,
  onChange,
  compact = false,
}: ProductSpecsEditorProps) {
  const { data: shop } = useShopSettings();
  const templates = getIndustrySpecTemplates(shop?.industryKey);
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState("");
  const [priceIndex, setPriceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (specs.length === 0) {
      setActive(0);
      return;
    }
    if (active > specs.length - 1) setActive(specs.length - 1);
  }, [specs.length, active]);

  useEffect(() => {
    setDraft("");
    setPriceIndex(null);
  }, [active]);

  const existingNames = new Set(
    specs.map((s) => s.name.trim().toLowerCase()).filter(Boolean),
  );
  const availableTemplates = templates.filter(
    (t) => !existingNames.has(t.name.trim().toLowerCase()),
  );

  const current = specs[active] ?? null;

  const updateSpec = (index: number, patch: Partial<ProductSpec>) => {
    onChange(specs.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addSpec = (seed?: IndustrySpecTemplate) => {
    const next = [
      ...specs,
      seed
        ? specFromTemplate(seed, specs.length + 1)
        : emptySpec(specs.length + 1),
    ];
    onChange(next);
    setActive(next.length - 1);
  };

  const removeSpec = (index: number) => {
    const next = specs.filter((_, i) => i !== index);
    onChange(next);
    setActive((prev) => {
      if (next.length === 0) return 0;
      if (prev > index) return prev - 1;
      if (prev === index) return Math.min(index, next.length - 1);
      return prev;
    });
  };

  const isColorAttr = current ? looksLikeColorSpec(current.name) : false;

  const addValue = () => {
    if (!current) return;
    const value = draft.trim();
    if (!value) return;
    if (current.values.some((v) => v.value.trim() === value)) {
      setDraft("");
      return;
    }
    const colorHex = looksLikeColorSpec(current.name)
      ? suggestColorHex(value)
      : null;
    const values = [
      ...current.values,
      emptyValue(current.values.length + 1, value, colorHex),
    ];
    updateSpec(active, {
      values,
      isOrderParameter:
        values.length >= 2 ? current.isOrderParameter : false,
    });
    setDraft("");
  };

  const removeValue = (valueIndex: number) => {
    if (!current) return;
    const values = current.values.filter((_, i) => i !== valueIndex);
    updateSpec(active, {
      values,
      isOrderParameter: values.length >= 2 ? current.isOrderParameter : false,
    });
    if (priceIndex === valueIndex) setPriceIndex(null);
  };

  const canChoose = current ? filledCount(current) >= 2 : false;
  const chooseOn = Boolean(current?.isOrderParameter && canChoose);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col gap-3",
        compact ? "max-h-[min(52vh,380px)]" : "h-full flex-1",
      )}
    >
      {/* میانبر */}
      {availableTemplates.length > 0 ? (
        <div className="flex shrink-0 flex-wrap gap-1.5">
          {availableTemplates.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => addSpec(t)}
              className="inline-flex h-7 items-center gap-1 rounded-md border border-dashed border-border px-2.5 text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <Plus className="size-3" />
              {t.name}
            </button>
          ))}
        </div>
      ) : null}

      {specs.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/15 px-4 py-8 text-center">
          <ListChecks className="size-8 text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium">هنوز ویژگی ندارید</p>
            <p className="text-xs text-muted-foreground">
              از میانبر بالا یا دکمه زیر استفاده کنید
            </p>
          </div>
          <Button type="button" size="sm" className="h-8 gap-1.5" onClick={() => addSpec()}>
            <Plus className="size-3.5" />
            ویژگی جدید
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "grid min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card",
            compact
              ? "grid-rows-[auto_minmax(0,1fr)]"
              : "grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[200px_minmax(0,1fr)] md:grid-rows-1",
          )}
        >
          {/* لیست ویژگی‌ها — جدا و قابل تشخیص */}
          <aside
            className={cn(
              "flex shrink-0 flex-col border-border bg-muted/25",
              compact
                ? "border-b"
                : "border-b md:border-b-0 md:border-e",
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/70 px-2.5 py-2">
              <span className="text-[11px] font-semibold text-muted-foreground">
                ویژگی‌ها ({toPersianDigits(String(specs.length))})
              </span>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="size-7"
                title="ویژگی جدید"
                onClick={() => addSpec()}
              >
                <Plus className="size-3.5" />
              </Button>
            </div>

            <div
              className={cn(
                "flex gap-1 overflow-x-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                !compact && "md:flex-col md:overflow-y-auto md:overflow-x-hidden",
              )}
            >
              {specs.map((spec, index) => {
                const selected = index === active;
                const count = filledCount(spec);
                const label =
                  spec.name.trim() ||
                  `ویژگی ${toPersianDigits(String(index + 1))}`;
                const buyerPick =
                  spec.isOrderParameter && count >= 2;

                return (
                  <button
                    key={`${spec.id ?? "s"}-${index}`}
                    type="button"
                    onClick={() => setActive(index)}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-start transition",
                      "min-w-[7.5rem] md:min-w-0 md:w-full",
                      selected
                        ? "bg-background shadow-sm ring-1 ring-border"
                        : "hover:bg-background/70",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        selected ? "bg-primary" : "bg-border",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">
                        {label}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                        {toPersianDigits(String(count))} گزینه
                        {buyerPick ? " · انتخابی" : ""}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* پنل ویرایش فقط یک ویژگی */}
          {current ? (
            <div className="flex min-h-0 min-w-0 flex-col">
              <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2.5">
                <Input
                  value={current.name}
                  placeholder="نام ویژگی (مثل رنگ)"
                  className="h-9 flex-1 text-sm font-medium"
                  onChange={(e) =>
                    updateSpec(active, { name: e.target.value })
                  }
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  title="حذف این ویژگی"
                  onClick={() => removeSpec(active)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      گزینه‌ها
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isColorAttr
                        ? "دایره = رنگ نمایشی در فروشگاه"
                        : chooseOn
                          ? "± = تفاوت قیمت"
                          : null}
                    </p>
                  </div>

                  {current.values.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {current.values.map((val, valueIndex) => {
                        const adj = Math.trunc(val.priceAdjustment || 0);
                        const priceOpen = priceIndex === valueIndex;
                        const swatch = resolveSwatchColor(
                          val.value,
                          val.colorHex,
                        );
                        return (
                          <div
                            key={`${val.id ?? "v"}-${valueIndex}`}
                            className="inline-flex flex-col gap-1"
                          >
                            <div
                              className={cn(
                                "inline-flex items-center rounded-md border bg-muted/30",
                                chooseOn && adj !== 0
                                  ? "border-primary/35"
                                  : "border-border",
                              )}
                            >
                              {isColorAttr ? (
                                <label
                                  className="relative ms-1.5 inline-flex size-6 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border shadow-inner"
                                  title="انتخاب رنگ سواچ"
                                  style={{ backgroundColor: swatch }}
                                >
                                  <input
                                    type="color"
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    value={
                                      /^#[0-9a-fA-F]{6}$/.test(swatch)
                                        ? swatch
                                        : "#808080"
                                    }
                                    onChange={(e) =>
                                      updateSpec(active, {
                                        values: current.values.map((v, i) =>
                                          i === valueIndex
                                            ? {
                                                ...v,
                                                colorHex: e.target.value,
                                              }
                                            : v,
                                        ),
                                      })
                                    }
                                  />
                                </label>
                              ) : null}
                              <input
                                value={val.value}
                                onChange={(e) => {
                                  const nextName = e.target.value;
                                  updateSpec(active, {
                                    values: current.values.map((v, i) =>
                                      i === valueIndex
                                        ? {
                                            ...v,
                                            value: nextName,
                                            // اگر ادمین هنوز رنگ دستی نزده، از نام پیشنهاد بده
                                            colorHex:
                                              isColorAttr && !v.colorHex
                                                ? suggestColorHex(nextName)
                                                : v.colorHex,
                                          }
                                        : v,
                                    ),
                                  });
                                }}
                                className="w-[4.5rem] bg-transparent px-2 py-1.5 text-xs outline-none sm:w-24"
                                placeholder={isColorAttr ? "آبی تیره" : "گزینه"}
                              />
                              {chooseOn ? (
                                <button
                                  type="button"
                                  className="border-s border-border px-1.5 py-1.5 text-[10px] tabular-nums text-muted-foreground hover:bg-background"
                                  onClick={() =>
                                    setPriceIndex(
                                      priceOpen ? null : valueIndex,
                                    )
                                  }
                                >
                                  {adj === 0
                                    ? "±"
                                    : adj > 0
                                      ? `+${formatAdj(adj)}`
                                      : formatAdj(adj)}
                                </button>
                              ) : null}
                              <button
                                type="button"
                                className="inline-flex size-7 items-center justify-center border-s border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label="حذف"
                                onClick={() => removeValue(valueIndex)}
                              >
                                <X className="size-3" />
                              </button>
                            </div>
                            {chooseOn && priceOpen ? (
                              <Input
                                dir="ltr"
                                className="h-7 w-24 text-[11px]"
                                placeholder="تفاوت قیمت"
                                value={formatAdj(adj)}
                                onChange={(e) =>
                                  updateSpec(active, {
                                    values: current.values.map((v, i) =>
                                      i === valueIndex
                                        ? {
                                            ...v,
                                            priceAdjustment: parseAdj(
                                              e.target.value,
                                            ),
                                          }
                                        : v,
                                    ),
                                  })
                                }
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="rounded-md bg-muted/30 px-2.5 py-2 text-[11px] text-muted-foreground">
                      {isColorAttr
                        ? "مثلاً «آبی تیره» بنویس و Enter بزن — بعد دایره را دقیق تنظیم کن"
                        : "گزینه‌ای نیست — پایین بنویس و Enter بزن"}
                    </p>
                  )}

                  <div className="flex gap-1.5">
                    <Input
                      value={draft}
                      placeholder={
                        isColorAttr ? "آبی تیره + Enter" : "گزینه + Enter"
                      }
                      className="h-9 flex-1 text-sm"
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addValue();
                        }
                      }}
                    />
                    {isColorAttr && draft.trim() ? (
                      <span
                        className="size-9 shrink-0 rounded-full border border-border"
                        style={{
                          backgroundColor: suggestColorHex(draft),
                        }}
                        title="پیش‌نمایش رنگ"
                      />
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 shrink-0 px-3"
                      disabled={!draft.trim()}
                      onClick={addValue}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
                    canChoose
                      ? "border-border bg-muted/20"
                      : "border-transparent bg-muted/10 opacity-60",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium">خریدار انتخاب کند</p>
                    <p className="text-[10px] text-muted-foreground">
                      {canChoose
                        ? "در فروشگاه یکی از گزینه‌ها را برمی‌گزیند"
                        : "حداقل ۲ گزینه لازم است"}
                    </p>
                  </div>
                  <Switch
                    checked={chooseOn}
                    disabled={!canChoose}
                    onCheckedChange={(checked) =>
                      updateSpec(active, {
                        isOrderParameter: checked,
                        values: current.values.map((v) => ({
                          ...v,
                          priceAdjustment: checked ? v.priceAdjustment : 0,
                        })),
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
