"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-medium text-red-600">۵۰۰</p>
      <h1 className="mt-2 text-3xl font-bold">خطای سرور</h1>
      <p className="mt-3 text-sm text-muted-foreground leading-7">
        مشکلی پیش آمد. لطفاً دوباره تلاش کنید.
      </p>
      {error?.digest && <p className="mt-2 text-xs text-muted-foreground">کد: {error.digest}</p>}
      <Button className="mt-6" onClick={reset}>
        تلاش مجدد
      </Button>
    </div>
  );
}
