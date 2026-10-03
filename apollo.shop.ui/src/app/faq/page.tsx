import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سوالات متداول",
  description: "پاسخ سوالات رایج درباره خرید از فروشگاه آپولو",
};

const faqs = [
  {
    q: "چطور سفارش ثبت کنم؟",
    a: "محصول را به سبد اضافه کنید، وارد حساب شوید، آدرس را انتخاب کرده و پرداخت را انجام دهید.",
  },
  {
    q: "روش‌های پرداخت چیست؟",
    a: "پرداخت آنلاین از طریق درگاه sandbox فعال است و پس از تأیید، وضعیت سفارش به‌روز می‌شود.",
  },
  {
    q: "چگونه پیگیری سفارش کنم؟",
    a: "از بخش حساب کاربری > سفارش‌ها می‌توانید وضعیت هر سفارش را ببینید.",
  },
  {
    q: "پشتیبانی چگونه است؟",
    a: "از بخش تیکت‌ها در پنل کاربری پیام بفرستید؛ تیم پشتیبانی پاسخ می‌دهد.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">سوالات متداول</h1>
      <p className="mt-2 text-sm text-muted-foreground">پاسخ‌های کوتاه برای مسیرهای رایج خرید</p>
      <div className="mt-8 space-y-4">
        {faqs.map((item) => (
          <details key={item.q} className="rounded-xl border border-border p-4 open:bg-muted/30">
            <summary className="cursor-pointer font-medium">{item.q}</summary>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
