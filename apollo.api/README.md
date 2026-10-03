# Apollo API

بک‌اند محصول آپولو با **.NET 10**، **Clean Architecture**، **CQRS (MediatR)**، **EF Core** و **SQL Server**.

## ساختار پروژه

```
src/
├── Apollo.Domain/          # قوانین دامنه، اعتبارسنجی کد ملی
├── Apollo.Application/     # CQRS، FluentValidation، قراردادها
├── Apollo.Infrastructure/  # EF Core، Identity، JWT
└── Apollo.Api/             # REST API
```

## پیش‌نیازها

- .NET 10 SDK
- SQL Server (Docker یا نمونه محلی)

### اجرای SQL Server با Docker

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Apollo@12345" \
  -p 1433:1433 --name apollo-sql -d mcr.microsoft.com/mssql/server:2022-latest
```

## اجرا

```bash
cd apollo.api
dotnet restore
dotnet ef database update --project src/Apollo.Infrastructure --startup-project src/Apollo.Api
dotnet run --project src/Apollo.Api
```

API روی `http://localhost:5157` اجرا می‌شود.

## احراز هویت

| متد | مسیر | توضیح |
|-----|------|--------|
| POST | `/api/auth/register` | ثبت‌نام |
| POST | `/api/auth/login` | ورود |
| GET | `/api/auth/me` | پروفایل کاربر (نیاز به JWT) |

### فیلدهای کاربر

- نام، نام خانوادگی
- ایمیل (فرمت معتبر)
- رمز عبور (حداقل ۸ کاراکتر، حروف بزرگ/کوچک و عدد)
- شماره موبایل (۰۹xxxxxxxxx)
- کد ملی (۱۰ رقم + الگوریتم اعتبارسنجی)
- تصویر پروفایل (رشته URL، اختیاری)

## امنیت

- ASP.NET Core Identity با قفل حساب پس از ۵ تلاش ناموفق
- JWT کوتاه‌مدت + Refresh Token در دیتابیس
- Rate limiting روی endpointهای احراز هویت
- CORS محدود به فرانت‌اند
- اعتبارسنجی لایه Application با FluentValidation

## تنظیمات

`appsettings.Development.json`:

- `ConnectionStrings:DefaultConnection`
- `Jwt:Secret` (حداقل ۳۲ کاراکتر در production)
- `Cors:AllowedOrigins`
