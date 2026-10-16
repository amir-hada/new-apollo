"use client";

import {
  FormEvent,
  isValidElement,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingSelect } from "@/components/ui/floating-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AddressField,
  type AddressFieldErrors,
  firstErrorField,
  normalizeAddressPayload,
  validateAddressField,
  validateAddressForm,
} from "@/features/account/address-validation";
import {
  citiesForProvince,
  PROVINCE_OPTIONS,
} from "@/features/account/iran-geo";
import {
  formatPhoneDisplay,
  normalizeDigits,
  normalizePhoneInput,
  toPersianDigits,
} from "@/features/auth/normalize-phone";
import { cn } from "@/lib/utils";
import type { UpsertAddressRequest } from "@/types/api";

const empty: UpsertAddressRequest = {
  title: "",
  fullName: "",
  phone: "",
  province: "",
  city: "",
  postalCode: "",
  line1: "",
  line2: "",
  isDefault: false,
};

type AddressFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: UpsertAddressRequest | null;
  title?: string;
  submitting?: boolean;
  onSubmit: (data: UpsertAddressRequest) => void;
};

export function AddressFormDialog({
  open,
  onOpenChange,
  initial,
  title = "افزودن آدرس جدید",
  submitting,
  onSubmit,
}: AddressFormDialogProps) {
  const [form, setForm] = useState<UpsertAddressRequest>(empty);
  const [errors, setErrors] = useState<AddressFieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<AddressField, boolean>>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm(initial ? { ...empty, ...initial, line2: initial.line2 ?? "" } : empty);
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }, [open, initial]);

  function clearFieldError(field: AddressField) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function patch<K extends keyof UpsertAddressRequest>(
    key: K,
    value: UpsertAddressRequest[K],
  ) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (submitted || touched[key as AddressField]) {
        const field = key as AddressField;
        if (
          field === "title" ||
          field === "fullName" ||
          field === "phone" ||
          field === "postalCode" ||
          field === "province" ||
          field === "city" ||
          field === "line1" ||
          field === "line2"
        ) {
          const message = validateAddressField(field, next);
          setErrors((prev) => {
            const copy = { ...prev };
            if (message) copy[field] = message;
            else delete copy[field];
            return copy;
          });
        }
      } else if (key in errors) {
        clearFieldError(key as AddressField);
      }
      return next;
    });
  }

  function markTouched(field: AddressField) {
    setTouched((t) => ({ ...t, [field]: true }));
    setForm((current) => {
      const message = validateAddressField(field, current);
      setErrors((prev) => {
        const copy = { ...prev };
        if (message) copy[field] = message;
        else delete copy[field];
        return copy;
      });
      return current;
    });
  }

  function showError(field: AddressField) {
    return Boolean((submitted || touched[field]) && errors[field]);
  }

  const provinceOptions = useMemo(() => {
    if (form.province && !PROVINCE_OPTIONS.some((p) => p.value === form.province)) {
      return [{ value: form.province, label: form.province }, ...PROVINCE_OPTIONS];
    }
    return PROVINCE_OPTIONS;
  }, [form.province]);

  const cityOptions = useMemo(() => {
    const cities = citiesForProvince(form.province);
    if (form.city && !cities.includes(form.city)) {
      cities.unshift(form.city);
    }
    return cities.map((c) => ({ value: c, label: c }));
  }, [form.province, form.city]);

  const postalDigits = normalizeDigits(form.postalCode);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = validateAddressForm(form);
    setErrors(nextErrors);
    const first = firstErrorField(nextErrors);
    if (first) {
      requestAnimationFrame(() => {
        const el =
          formRef.current?.querySelector<HTMLElement>(`#addr-${first}`) ??
          formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    onSubmit(normalizeAddressPayload(form));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92vh] w-[min(560px,calc(100%-1.5rem))] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
      >
        <DialogHeader className="gap-1 border-b border-border px-4 py-4 text-start sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-bold">{title}</DialogTitle>
              <DialogDescription className="mt-1 text-xs text-muted-foreground">
                مشخصات گیرنده و آدرس پستی را وارد کنید.
              </DialogDescription>
            </div>
            <button
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              onClick={() => onOpenChange(false)}
              aria-label="بستن"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <form
          ref={formRef}
          className="space-y-4 overflow-y-auto px-4 py-4 sm:px-5"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="عنوان آدرس"
              htmlFor="addr-title"
              required
              error={showError("title") ? errors.title : undefined}
              hint="مثلاً خانه یا محل کار"
            >
              <Input
                id="addr-title"
                data-field="title"
                className="h-10"
                placeholder="خانه"
                maxLength={100}
                aria-invalid={showError("title") || undefined}
                value={form.title}
                onChange={(e) => patch("title", e.target.value)}
                onBlur={() => markTouched("title")}
              />
            </Field>

            <Field
              label="نام گیرنده"
              htmlFor="addr-fullName"
              required
              error={showError("fullName") ? errors.fullName : undefined}
            >
              <Input
                id="addr-fullName"
                data-field="fullName"
                className="h-10"
                placeholder="نام و نام خانوادگی"
                maxLength={200}
                aria-invalid={showError("fullName") || undefined}
                value={form.fullName}
                onChange={(e) => patch("fullName", e.target.value)}
                onBlur={() => markTouched("fullName")}
              />
            </Field>

            <Field
              label="موبایل گیرنده"
              htmlFor="addr-phone"
              required
              error={showError("phone") ? errors.phone : undefined}
              hint="۱۱ رقم، مثل ۰۹۱۲۳۴۵۶۷۸۹"
            >
              <Input
                id="addr-phone"
                data-field="phone"
                className="h-10"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                maxLength={11}
                aria-invalid={showError("phone") || undefined}
                value={formatPhoneDisplay(form.phone)}
                onChange={(e) => patch("phone", normalizePhoneInput(e.target.value))}
                onBlur={() => markTouched("phone")}
              />
            </Field>

            <Field
              label="کد پستی"
              htmlFor="addr-postalCode"
              required
              error={showError("postalCode") ? errors.postalCode : undefined}
              hint={
                postalDigits
                  ? `${toPersianDigits(String(postalDigits.length))} از ۱۰ رقم`
                  : "۱۰ رقم بدون فاصله"
              }
            >
              <Input
                id="addr-postalCode"
                data-field="postalCode"
                className="h-10 tracking-wider"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="۱۲۳۴۵۶۷۸۹۰"
                maxLength={10}
                aria-invalid={showError("postalCode") || undefined}
                value={toPersianDigits(postalDigits)}
                onChange={(e) =>
                  patch("postalCode", normalizeDigits(e.target.value).slice(0, 10))
                }
                onBlur={() => markTouched("postalCode")}
              />
            </Field>

            <FloatingSelect
              id="addr-province"
              label="استان"
              required
              searchable
              searchPlaceholder="جستجوی استان..."
              value={form.province}
              options={provinceOptions}
              error={showError("province") ? errors.province : undefined}
              onChange={(province) => {
                setTouched((t) => ({ ...t, province: true }));
                setForm((f) => {
                  const next: UpsertAddressRequest = {
                    ...f,
                    province,
                    city: citiesForProvince(province).includes(f.city) ? f.city : "",
                  };
                  setErrors((prev) => {
                    const copy = { ...prev };
                    const provinceErr = validateAddressField("province", next);
                    if (provinceErr) copy.province = provinceErr;
                    else delete copy.province;
                    if (submitted || touched.city) {
                      const cityErr = validateAddressField("city", next);
                      if (cityErr) copy.city = cityErr;
                      else delete copy.city;
                    } else {
                      delete copy.city;
                    }
                    return copy;
                  });
                  return next;
                });
              }}
            />

            <FloatingSelect
              id="addr-city"
              label="شهر"
              required
              searchable
              searchPlaceholder="جستجوی شهر..."
              value={form.city}
              options={cityOptions}
              disabled={!form.province}
              inactive={!form.province}
              error={showError("city") ? errors.city : undefined}
              hint={!form.province ? "ابتدا استان را انتخاب کنید" : undefined}
              onInactiveClick={() => {
                setTouched((t) => ({ ...t, province: true, city: true }));
                setErrors((prev) => ({
                  ...prev,
                  province: prev.province ?? "ابتدا استان را انتخاب کنید",
                  city: "ابتدا استان را انتخاب کنید",
                }));
              }}
              onChange={(city) => {
                setTouched((t) => ({ ...t, city: true }));
                setForm((f) => {
                  const next = { ...f, city };
                  setErrors((prev) => {
                    const copy = { ...prev };
                    const cityErr = validateAddressField("city", next);
                    if (cityErr) copy.city = cityErr;
                    else delete copy.city;
                    return copy;
                  });
                  return next;
                });
              }}
            />

            <div className="sm:col-span-2">
              <Field
                label="آدرس کامل"
                htmlFor="addr-line1"
                required
                error={showError("line1") ? errors.line1 : undefined}
                hint="خیابان، کوچه، پلاک و واحد را بنویسید"
              >
                <Input
                  id="addr-line1"
                  data-field="line1"
                  className="h-10"
                  placeholder="خیابان …، کوچه …، پلاک …، واحد …"
                  maxLength={500}
                  aria-invalid={showError("line1") || undefined}
                  value={form.line1}
                  onChange={(e) => patch("line1", e.target.value)}
                  onBlur={() => markTouched("line1")}
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field
                label="توضیحات تکمیلی"
                htmlFor="addr-line2"
                error={showError("line2") ? errors.line2 : undefined}
                hint="اختیاری — مثلاً زنگ دوم"
              >
                <Input
                  id="addr-line2"
                  data-field="line2"
                  className="h-10"
                  maxLength={500}
                  aria-invalid={showError("line2") || undefined}
                  value={form.line2 ?? ""}
                  onChange={(e) => patch("line2", e.target.value)}
                  onBlur={() => markTouched("line2")}
                />
              </Field>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={form.isDefault}
              onChange={(e) => patch("isDefault", e.target.checked)}
            />
            تنظیم به‌عنوان آدرس پیش‌فرض
          </label>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              انصراف
            </Button>
            <Button type="submit" className="h-10 rounded-xl" disabled={submitting}>
              {submitting ? "در حال ذخیره..." : "ثبت آدرس"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
  required,
  error,
  hint,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  const errorId = `${htmlFor}-error`;
  const hintId = `${htmlFor}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className={cn(error && "text-destructive")}>
        {label}
        {required ? <span className="ms-0.5 text-destructive">*</span> : null}
      </Label>
      {control}
      {error ? (
        <p id={errorId} role="alert" className="text-[11px] leading-4 text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[11px] leading-4 text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
