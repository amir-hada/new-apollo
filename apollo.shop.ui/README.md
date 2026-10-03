# فروشگاه آپولو / ApolloShop UI

فرانت‌اند فروشگاه اینترنتی **ApolloShop** با برند فارسی **فروشگاه آپولو**.

## Stack

- Next.js 16 (App Router) — `output: "standalone"` برای Docker
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- Zustand
- next-themes
- Axios + Sonner

## ویژگی‌ها

- RTL کامل + فونت Vazirmatn
- تم روشن / تاریک / سیستم (پایدار)
- SEO: metadata، Open Graph، Twitter، JSON-LD (Product/Article)، sitemap، robots
- معماری feature-based
- فروشگاه، حساب کاربری، پنل ادمین

## پیش‌نیاز

API بک‌اند روی `http://localhost:5080` در حال اجرا باشد.

## نصب و اجرا

```bash
cd apollo.shop.ui
cp .env.example .env.local
npm install
npm run dev
```

اپ روی [http://localhost:3000](http://localhost:3000) اجرا می‌شود.

## متغیرهای محیطی

| متغیر | توضیح | پیش‌فرض |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | آدرس پایه API | `http://localhost:5080` |
| `NEXT_PUBLIC_SITE_URL` | آدرس عمومی سایت برای SEO | `http://localhost:3000` |

فایل نمونه: [`.env.example`](./.env.example)

## برند و UI

- نام برند: فروشگاه آپولو / ApolloShop
- رنگ اصلی: آبی (~`#2563eb`)
- پس‌زمینه سفید/خاکستری در حالت روشن و تیره در دارک‌مود
- مینیمال و حرفه‌ای؛ بدون گرادیان‌های غیرضروری

## اسکریپت‌ها

```bash
npm run dev    # توسعه
npm run build  # بیلد پروداکشن
npm run start  # اجرای بیلد
npm run lint   # eslint
```

## Docker

از پوشه API:

```bash
cd ../apollo.shop.api
docker compose up --build
```

UI روی پورت `3000` و با `NEXT_PUBLIC_API_URL=http://localhost:5080` بیلد می‌شود.

## ساختار مهم

```
src/
  app/                 # مسیرهای App Router
  components/          # UI مشترک، layout، SEO
  features/            # قابلیت‌های دامنه
  lib/                 # api، auth، cart، utils
  providers/           # Query + Theme + Toaster
  types/               # تایپ‌های هم‌تراز DTO بک‌اند
```

## حساب ادمین (seed بک‌اند)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@apolloshop.ir | Admin@12345 |
