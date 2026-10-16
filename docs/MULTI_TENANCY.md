# راهنمای چندفروشگاهی (Multi-Tenancy)

فروشگاه آپولو روی **یک دیتابیس مشترک** چند فروشگاه مستقل را نگه می‌دارد. هر فروشگاه با یک `slug` شناخته می‌شود و معمولاً روی ساب‌دامین همان slug باز می‌شود.

## مفاهیم

| مفهوم | معنی |
|--------|------|
| **Tenant** | یک فروشگاه (کاتالوگ، سبد، سفارش، کاربران، تنظیمات خودش) |
| **Slug** | شناسهٔ کوتاه انگلیسی مثل `apollo` یا `shop2` |
| **ساب‌دامین** | مثلاً `shop2.localhost:3000` یا `shop2.yourdomain.com` |
| **هدر `X-Tenant-Slug`** | فرانت این هدر را به API می‌فرستد تا بداند دادهٔ کدام فروشگاه را بخواهد |

فروشگاه پیش‌فرض seed شده: **`apollo`**  
ادمین پیش‌فرض: `admin@apolloshop.ir` / `Admin@12345`

ساخت فروشگاه جدید از پنل ادمین فروشگاه **غیرفعال** است؛ فقط از سایت‌ساز آپولو (`apollo.ui` → پلتفرم‌ها) انجام می‌شود. جزئیات در `docs/SITE_BUILDER.md`.

هر فروشگاه جدید با تنظیمات خالی، دسته‌بندی تیکت پیش‌فرض و یک کاربر Admin ساخته می‌شود — محصولات فروشگاه‌های دیگر کپی نمی‌شوند.

---

## ساخت از API (فقط پلتفرم آپولو)

Provisioning فقط از طریق endpoint داخلی با کلید مشترک (`X-Provisioning-Key`) و از سمت `apollo.api` انجام می‌شود:

```http
POST /api/internal/tenants
X-Provisioning-Key: <Provisioning:ApiKey>
Content-Type: application/json

{
  "slug": "shop2",
  "name": "فروشگاه ۲",
  "adminEmail": "admin@shop2.local",
  "adminPassword": "Admin@12345",
  "adminFirstName": "مدیر",
  "adminLastName": "فروشگاه",
  "shopTitle": "فروشگاه ۲",
  "primaryColor": "#0f172a"
}
```

---

## دسترسی محلی با ساب‌دامین

مرورگرهای مدرن `*.localhost` را به `127.0.0.1` resolve می‌کنند؛ معمولاً نیازی به hosts نیست.

1. API را اجرا کنید (`http://localhost:5080`)
2. فرانت را اجرا کنید (`http://localhost:3000`)
3. فروشگاه اصلی: `http://localhost:3000` یا `http://apollo.localhost:3000`
4. فروشگاه جدید: `http://shop2.localhost:3000`

اگر ساب‌دامین کار نکرد، در `.env.local` فرانت بگذارید:

```env
NEXT_PUBLIC_TENANT_SLUG=shop2
NEXT_PUBLIC_API_URL=http://localhost:5080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

و با همان `localhost:3000` تست کنید (بدون ساب‌دامین). برای چند فروشگاه همزمان، ساب‌دامین یا چندین env جدا بهتر است.

---

## پروداکشن / دامنه واقعی

1. DNS: رکورد wildcard مثل `*.yourdomain.com` → سرور فرانت
2. فرانت یک deployment با همان wildcard
3. API از ساب‌دامین Host یا هدر `X-Tenant-Slug` tenant را تشخیص می‌دهد
4. در صورت نیاز دامنهٔ اختصاصی: فیلد `CustomDomain` روی جدول `Tenants` (resolve از Host)

متغیرهای مهم API (`appsettings`):

```json
"Tenancy": { "DefaultSlug": "apollo" }
```

CORS برای `localhost` / `*.localhost` و originهای تنظیم‌شده باز است.

---

## امنیت و ایزوله بودن داده

- تقریباً همهٔ جداول کسب‌وکار `TenantId` دارند و با **EF query filter** فیلتر می‌شوند.
- JWT شامل `tenant_id` / `tenant_slug` است؛ توکن یک فروشگاه روی فروشگاه دیگر **403** می‌شود.
- سبد مهمان و توکن‌های auth در localStorage **به‌ازای هر slug** جدا ذخیره می‌شوند.
- نقش `PlatformAdmin` سراسری است (فقط روی کاربر پیش‌فرض apollo seed می‌شود)؛ نقش `Admin` فقط داخل همان فروشگاه قدرت دارد.

---

## عیب‌یابی سریع

| مشکل | کار |
|------|-----|
| 404 Tenant | slug اشتباه است یا tenant ساخته/فعال نشده |
| 403 بعد از لاگین | توکن متعلق به فروشگاه دیگری است؛ دوباره روی همان ساب‌دامین لاگین کنید |
| دادهٔ فروشگاه دیگر دیده می‌شود | هدر `X-Tenant-Slug` ارسال نمی‌شود — فرانت را به‌روز کنید / کش را خالی کنید |
| migration | با اجرای API، seeder خودش `MigrateAsync` می‌زند |

---

## مسیرهای کد مهم

- API middleware: `TenantResolutionMiddleware`, `TenantClaimValidationMiddleware`
- ساخت tenant: فقط `POST api/internal/tenants` (از `apollo.api`) → `CreateTenantCommand`
- فرانت فروشگاه: `src/lib/tenant.ts`, هدر در `api.ts` / `server-api.ts`
- UI ساخت فروشگاه: فقط داشبورد آپولو (`apollo.ui` → پلتفرم‌ها)، نه پنل `/admin` فروشگاه
