/** Titles shown in the admin header toolbar (and browser tab). */
const ADMIN_PAGE_TITLES: { match: RegExp; title: string }[] = [
  { match: /^\/admin\/?$/, title: "داشبورد" },
  { match: /^\/admin\/reports\/?$/, title: "گزارش‌ها" },
  { match: /^\/admin\/products\/[^/]+/, title: "ویرایش محصول" },
  { match: /^\/admin\/products/, title: "محصولات" },
  { match: /^\/admin\/categories\/[^/]+/, title: "ویرایش دسته" },
  { match: /^\/admin\/categories/, title: "دسته‌بندی‌ها" },
  { match: /^\/admin\/brands\/[^/]+/, title: "ویرایش برند" },
  { match: /^\/admin\/brands/, title: "برندها" },
  { match: /^\/admin\/inventory/, title: "انبار" },
  { match: /^\/admin\/coupons/, title: "کد تخفیف" },
  { match: /^\/admin\/orders/, title: "سفارش‌ها" },
  { match: /^\/admin\/users/, title: "کاربران" },
  { match: /^\/admin\/chats/, title: "پشتیبانی" },
  { match: /^\/admin\/blog/, title: "بلاگ" },
  { match: /^\/admin\/tickets/, title: "تیکت‌ها" },
  { match: /^\/admin\/settings/, title: "تنظیمات" },
  { match: /^\/admin\/billing/, title: "صورتحساب" },
  { match: /^\/admin\/help/, title: "راهنما" },
  { match: /^\/admin/, title: "پنل مدیریت" },
];

export function getAdminPageTitle(pathname: string): string | null {
  for (const item of ADMIN_PAGE_TITLES) {
    if (item.match.test(pathname)) return item.title;
  }
  return null;
}
