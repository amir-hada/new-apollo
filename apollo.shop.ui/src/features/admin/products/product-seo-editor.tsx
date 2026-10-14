"use client";

import { useId, useState } from "react";
import { Search } from "lucide-react";
import { FloatingField } from "@/components/ui/floating-field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { resolveProductImageUrl } from "@/lib/product-image";
import { cn } from "@/lib/utils";

export type ProductSeoForm = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  focusKeyword: string;
  canonicalUrl: string;
  robotsNoIndex: boolean;
  robotsNoFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
};

type ProductSeoEditorProps = {
  value: ProductSeoForm;
  productName: string;
  productSlug: string;
  primaryImageUrl?: string | null;
  onChange: (patch: Partial<ProductSeoForm>) => void;
};

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
            <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.35" />
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
          className="max-w-[20rem] px-3 py-2 text-start text-[11px] leading-5 font-normal"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function CharMeter({
  length,
  idealMin,
  idealMax,
  hardMax,
}: {
  length: number;
  idealMin: number;
  idealMax: number;
  hardMax: number;
}) {
  const ok = length >= idealMin && length <= idealMax;
  const warn = length > 0 && (length < idealMin || length > idealMax);
  const bad = length > hardMax;
  return (
    <span
      className={cn(
        "shrink-0 text-[10px] leading-none",
        bad
          ? "text-destructive"
          : ok
            ? "text-emerald-700 dark:text-emerald-400"
            : warn
              ? "text-amber-700 dark:text-amber-400"
              : "text-muted-foreground",
      )}
    >
      {toPersianDigits(String(length))}/{toPersianDigits(String(idealMax))}
    </span>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  hint,
  rows = 2,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
  className?: string;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const floating = focused || value.trim().length > 0;

  return (
    <div className={cn("relative w-full min-h-0", className)}>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder=" "
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-full min-h-[3.25rem] w-full resize-none rounded-lg border bg-card px-3 pb-1.5 pt-4 text-sm leading-5 outline-none transition-colors",
          "text-foreground/75",
          focused || floating ? "border-foreground/35" : "border-border",
        )}
      />
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute start-2.5 flex items-center gap-1 bg-card px-1 transition-all",
          floating
            ? "top-0 -translate-y-1/2 text-[11px] text-muted-foreground"
            : "top-2.5 text-sm text-muted-foreground/80",
        )}
      >
        <span>{label}</span>
        {hint ? (
          <span className="pointer-events-auto">
            <Hint text={hint} />
          </span>
        ) : null}
      </label>
    </div>
  );
}

export function ProductSeoEditor({
  value,
  productName,
  productSlug,
  primaryImageUrl,
  onChange,
}: ProductSeoEditorProps) {
  const siteHost =
    typeof window !== "undefined" ? window.location.host : "example.com";
  const defaultPath = `/products/${productSlug || "slug"}`;
  const previewTitle =
    value.seoTitle.trim() || productName.trim() || "عنوان محصول در نتایج جستجو";
  const previewDesc =
    value.seoDescription.trim() ||
    "توضیح کوتاه و جذاب درباره محصول که در نتایج گوگل نمایش داده می‌شود.";
  const previewUrl =
    value.canonicalUrl.trim() || `https://${siteHost}${defaultPath}`;
  const ogImage =
    value.ogImageUrl.trim() ||
    resolveProductImageUrl(primaryImageUrl);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden pt-1 lg:grid-cols-2 lg:gap-3">
      {/* جستجو و ایندکس */}
      <div className="flex min-h-0 flex-col gap-2 overflow-hidden rounded-xl border border-border/80 bg-card/40 p-2.5 sm:p-3">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <h3 className="text-[11px] font-medium text-muted-foreground">
            جستجو و ایندکس
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Label className="text-[11px] text-muted-foreground">noindex</Label>
              <Hint text="برای محصولات منتشرشده خاموش بماند. برای پیش‌نویس یا تست روشن کنید." />
              <Switch
                checked={value.robotsNoIndex}
                onCheckedChange={(robotsNoIndex) => onChange({ robotsNoIndex })}
                className="scale-90"
              />
            </div>
            <div className="flex items-center gap-1">
              <Label className="text-[11px] text-muted-foreground">nofollow</Label>
              <Hint text="در بیشتر محصولات فروشگاهی خاموش بماند." />
              <Switch
                checked={value.robotsNoFollow}
                onCheckedChange={(robotsNoFollow) => onChange({ robotsNoFollow })}
                className="scale-90"
              />
            </div>
          </div>
        </div>

        <div className="grid shrink-0 gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <FloatingField
              label="کلمه کلیدی اصلی"
              hint="یک عبارت اصلی جستجوشونده؛ عنوان و توضیح را حول همان بنویسید."
              value={value.focusKeyword}
              onChange={(focusKeyword) => onChange({ focusKeyword })}
            />
            <div className="flex justify-end px-1">
              <CharMeter
                length={value.focusKeyword.trim().length}
                idealMin={2}
                idealMax={40}
                hardMax={120}
              />
            </div>
          </div>
          <div className="space-y-1">
            <FloatingField
              label="عنوان سئو"
              hint="الگوی پیشنهادی: «کلمه کلیدی + ویژگی | برند». اگر خالی باشد نام محصول استفاده می‌شود."
              value={value.seoTitle}
              onChange={(seoTitle) => onChange({ seoTitle })}
            />
            <div className="flex justify-end px-1">
              <CharMeter
                length={value.seoTitle.trim().length}
                idealMin={50}
                idealMax={60}
                hardMax={250}
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1">
          <TextAreaField
            className="min-h-0 flex-1"
            label="توضیحات سئو"
            hint="فایده، ویژگی مهم و دعوت به اقدام. اگر خالی باشد از ابتدای توضیحات محصول استفاده می‌شود."
            value={value.seoDescription}
            onChange={(seoDescription) => onChange({ seoDescription })}
            rows={3}
          />
          <div className="flex shrink-0 justify-end px-1">
            <CharMeter
              length={value.seoDescription.trim().length}
              idealMin={140}
              idealMax={160}
              hardMax={500}
            />
          </div>
        </div>

        <div className="grid shrink-0 gap-2 sm:grid-cols-2">
          <FloatingField
            label="کلمات کلیدی"
            hint="۲ تا ۵ عبارت مرتبط با ویرگول. مثال: عطر مردانه، ادکلن چوبی."
            value={value.seoKeywords}
            onChange={(seoKeywords) => onChange({ seoKeywords })}
          />
          <FloatingField
            label="کنونیکال"
            dir="ltr"
            hint={`اگر خالی باشد از ${defaultPath} استفاده می‌شود. فقط در صورت نیاز آدرس مطلق کامل را وارد کنید.`}
            value={value.canonicalUrl}
            onChange={(canonicalUrl) => onChange({ canonicalUrl })}
          />
        </div>
      </div>

      {/* پیش‌نمایش + OG */}
      <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
        <div className="shrink-0 rounded-xl border border-border/80 bg-card/40 p-2.5 sm:p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Search className="size-3.5 text-muted-foreground" />
            <h3 className="text-[11px] font-medium text-muted-foreground">
              پیش‌نمایش گوگل
            </h3>
            <Hint text="تقریبی است؛ گوگل ممکن است عنوان یا توضیح را بازنویسی کند." />
          </div>
          <div className="space-y-0.5 rounded-lg bg-background/80 p-2" dir="ltr">
            <p className="truncate text-[10px] text-[#202124] dark:text-muted-foreground">
              {previewUrl}
            </p>
            <p className="line-clamp-1 text-sm leading-snug text-[#1a0dab] dark:text-blue-400">
              {previewTitle}
            </p>
            <p className="line-clamp-2 text-[11px] leading-4 text-[#4d5156] dark:text-muted-foreground">
              {previewDesc}
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-xl border border-border/80 bg-card/40 p-2.5 sm:p-3">
          <div className="flex shrink-0 items-center gap-1">
            <h3 className="text-[11px] font-medium text-muted-foreground">
              اشتراک اجتماعی (Open Graph)
            </h3>
            <Hint text="اگر خالی باشد از عنوان/توضیح سئو و تصویر اصلی محصول استفاده می‌شود." />
          </div>

          <FloatingField
            label="عنوان Open Graph"
            hint="نسخه کوتاه و جذاب برای شبکه‌های اجتماعی."
            value={value.ogTitle}
            onChange={(ogTitle) => onChange({ ogTitle })}
          />

          <TextAreaField
            className="min-h-0 flex-1"
            label="توضیحات Open Graph"
            hint="لحن دوستانه‌تر برای اشتراک در پیام‌رسان‌ها و شبکه‌ها."
            value={value.ogDescription}
            onChange={(ogDescription) => onChange({ ogDescription })}
            rows={2}
          />

          <div className="grid shrink-0 gap-2 sm:grid-cols-[minmax(0,1fr)_5.5rem]">
            <FloatingField
              label="آدرس تصویر OG"
              dir="ltr"
              hint="ترجیحاً حداقل ۱۲۰۰×۶۳۰. اگر خالی باشد تصویر اصلی محصول استفاده می‌شود."
              value={value.ogImageUrl}
              onChange={(ogImageUrl) => onChange({ ogImageUrl })}
            />
            {ogImage ? (
              <div className="overflow-hidden rounded-lg border border-border/70 bg-muted/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ogImage}
                  alt="پیش‌نمایش تصویر اشتراک"
                  className="h-12 w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 items-center justify-center rounded-lg border border-dashed border-border/70 px-1 text-center text-[10px] leading-3 text-muted-foreground">
                تصویر محصول
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
