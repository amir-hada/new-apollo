# سایت‌ساز آپولو (Apollo Site Builder)

آپولو یک **سایت‌ساز SaaS** است: ادمین پلن «سایت فروشگاهی» تعریف می‌کند، کاربر از داشبورد سایت می‌سازد، و یک نسخهٔ مولتی‌تننت از فروشگاه برایش provision می‌شود.

## اجزا

| سرویس | نقش | آدرس لوکال |
|--------|------|------------|
| `apollo.api` | پلتفرم (پلن، سایت کاربر، provisioning، SSO) | http://localhost:5157 |
| `apollo.ui` | داشبورد کاربر | http://localhost:5173 |
| `apollo.admin.ui` | پنل ادمین آپولو | http://localhost:5174 |
| `apollo.shop.api` | فروشگاه مولتی‌تننت | http://localhost:5080 |
| `apollo.shop.ui` | استورفرانت / پنل فروشگاه | http://localhost:3000 |

کلید مشترک توسعه: `dev-apollo-shop-provisioning-key`  
(در shop: `Provisioning:ApiKey` — در apollo: `Shop:ProvisioningKey`)

## جریان کاربر

```
ادمین → پلن ProductType=Shop می‌سازد و منتشر می‌کند
کاربر → پلتفرم + slug می‌سازد
apollo.api → POST shop/api/internal/tenants (با X-Provisioning-Key)
فروشگاه → Tenant + تنظیمات + ادمین ساخته می‌شود
کاربر → «ورود به پنل فروشگاه» → SSO one-time code → /admin
```

## تست سریع لوکال

1. هر پنج سرویس بالا را اجرا کنید (migrationها موقع استارت API اعمال می‌شوند).
2. **ادمین آپولو** (`:5174`): پلن جدید با نوع «سایت فروشگاهی» → انتشار.
3. **کاربر آپولو** (`:5173`): پلتفرم‌ها → افزودن با نام + slug (مثلاً `demo1`).
4. وضعیت باید `Ready` شود؛ «مشاهده فروشگاه» → `http://demo1.localhost:3000`.
5. «ورود به پنل فروشگاه» → SSO به `/admin` همان فروشگاه.
6. در ادمین آپولو منوی **سایت‌ها** را ببینید.

## Endpointهای مهم

### apollo.api
- `POST /api/platforms` — `{ planId, name, slug }`
- `POST /api/platforms/{id}/retry-provisioning`
- `POST /api/platforms/{id}/shop-sso` → `{ redirectUrl }`
- `GET /api/admin/sites`

### apollo.shop.api (داخلی)
- `POST /api/internal/tenants` — هدر `X-Provisioning-Key`
- `POST /api/internal/tenants/{slug}/sso-code` — هدر کلید
- `POST /api/internal/sso/exchange` — `{ code }` (بدون کلید؛ برای مرورگر)

## نکات

- ساب‌دامین لوکال: `*.localhost` در Chrome/Edge معمولاً بدون hosts کار می‌کند.
- Tenant سیستمی `apollo` قالب داخلی است؛ سایت‌های واقعی کاربران روی slug خودشان هستند.
- پرداخت/اشتراک در این فاز نیست؛ اسکلت وضعیت provisioning آماده است.
