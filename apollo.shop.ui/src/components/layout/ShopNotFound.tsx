const APOLLO_URL = process.env.NEXT_PUBLIC_APOLLO_URL || "http://127.0.0.1:5173";

export function ShopNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-medium text-primary">۴۰۴</p>
      <h1 className="mt-2 text-3xl font-bold">فروشگاه یافت نشد</h1>
      <p className="mt-3 text-sm text-muted-foreground leading-7">
        این آدرس متعلق به هیچ فروشگاه فعالی نیست. فروشگاه جدید فقط از طریق پنل آپولو ساخته و فعال
        می‌شود.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href={APOLLO_URL}
          className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
        >
          ورود به پنل آپولو
        </a>
      </div>
    </div>
  );
}
