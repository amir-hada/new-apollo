import { citiesForProvince, IRAN_PROVINCES } from "@/features/account/iran-geo";
import {
  isValidIranianMobile,
  normalizeDigits,
} from "@/features/auth/normalize-phone";
import type { UpsertAddressRequest } from "@/types/api";

export type AddressField =
  | "title"
  | "fullName"
  | "phone"
  | "postalCode"
  | "province"
  | "city"
  | "line1"
  | "line2";

export type AddressFieldErrors = Partial<Record<AddressField, string>>;

const NAME_PATTERN = /^[\u0600-\u06FFa-zA-Z\u200c\s.\-]+$/;
const POSTAL_PATTERN = /^\d{10}$/;

export function validateAddressField(
  field: AddressField,
  form: UpsertAddressRequest,
): string | undefined {
  switch (field) {
    case "title": {
      const v = form.title.trim();
      if (!v) return "عنوان آدرس را وارد کنید";
      if (v.length < 2) return "عنوان باید حداقل ۲ کاراکتر باشد";
      if (v.length > 100) return "عنوان نباید بیشتر از ۱۰۰ کاراکتر باشد";
      return undefined;
    }
    case "fullName": {
      const v = form.fullName.trim();
      if (!v) return "نام گیرنده را وارد کنید";
      if (v.length < 3) return "نام گیرنده باید حداقل ۳ کاراکتر باشد";
      if (v.length > 200) return "نام گیرنده نباید بیشتر از ۲۰۰ کاراکتر باشد";
      if (!NAME_PATTERN.test(v)) return "نام گیرنده فقط می‌تواند شامل حروف باشد";
      return undefined;
    }
    case "phone": {
      const digits = normalizeDigits(form.phone);
      if (!digits) return "شماره موبایل گیرنده را وارد کنید";
      if (digits.length < 11) return "شماره موبایل باید ۱۱ رقم باشد";
      if (!isValidIranianMobile(digits))
        return "شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)";
      return undefined;
    }
    case "postalCode": {
      const digits = normalizeDigits(form.postalCode);
      if (!digits) return "کد پستی را وارد کنید";
      if (digits.length !== 10) return "کد پستی باید دقیقاً ۱۰ رقم باشد";
      if (!POSTAL_PATTERN.test(digits)) return "کد پستی فقط باید عدد باشد";
      if (/^0+$/.test(digits)) return "کد پستی معتبر نیست";
      return undefined;
    }
    case "province": {
      const v = form.province.trim();
      if (!v) return "استان را انتخاب کنید";
      if (!(IRAN_PROVINCES as readonly string[]).includes(v))
        return "استان انتخاب‌شده معتبر نیست";
      return undefined;
    }
    case "city": {
      const province = form.province.trim();
      const v = form.city.trim();
      if (!province) return "ابتدا استان را انتخاب کنید";
      if (!v) return "شهر را انتخاب کنید";
      if (!citiesForProvince(province).includes(v))
        return "شهر انتخاب‌شده با استان مطابقت ندارد";
      return undefined;
    }
    case "line1": {
      const v = form.line1.trim();
      if (!v) return "آدرس کامل را وارد کنید";
      if (v.length < 10) return "آدرس را کامل‌تر بنویسید (خیابان، کوچه، پلاک)";
      if (v.length > 500) return "آدرس نباید بیشتر از ۵۰۰ کاراکتر باشد";
      return undefined;
    }
    case "line2": {
      const v = (form.line2 ?? "").trim();
      if (v.length > 500) return "توضیحات نباید بیشتر از ۵۰۰ کاراکتر باشد";
      return undefined;
    }
    default:
      return undefined;
  }
}

const FIELD_ORDER: AddressField[] = [
  "title",
  "fullName",
  "phone",
  "postalCode",
  "province",
  "city",
  "line1",
  "line2",
];

export function validateAddressForm(form: UpsertAddressRequest): AddressFieldErrors {
  const errors: AddressFieldErrors = {};
  for (const field of FIELD_ORDER) {
    const message = validateAddressField(field, form);
    if (message) errors[field] = message;
  }
  return errors;
}

export function firstErrorField(errors: AddressFieldErrors): AddressField | null {
  for (const field of FIELD_ORDER) {
    if (errors[field]) return field;
  }
  return null;
}

export function normalizeAddressPayload(
  form: UpsertAddressRequest,
): UpsertAddressRequest {
  return {
    ...form,
    title: form.title.trim(),
    fullName: form.fullName.trim().replace(/\s+/g, " "),
    phone: normalizeDigits(form.phone),
    province: form.province.trim(),
    city: form.city.trim(),
    postalCode: normalizeDigits(form.postalCode),
    line1: form.line1.trim().replace(/\s+/g, " "),
    line2: form.line2?.trim() ? form.line2.trim().replace(/\s+/g, " ") : null,
  };
}
