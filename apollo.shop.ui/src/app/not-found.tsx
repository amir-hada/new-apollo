import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-medium text-primary">۴۰۴</p>
      <h1 className="mt-2 text-3xl font-bold">صفحه پیدا نشد</h1>
      <p className="mt-3 text-sm text-muted-foreground leading-7">
        صفحه‌ای که دنبال آن هستید وجود ندارد یا جابه‌جا شده است.
      </p>
      <Link href="/" className="mt-6">
        <Button>بازگشت به خانه</Button>
      </Link>
    </div>
  );
}
