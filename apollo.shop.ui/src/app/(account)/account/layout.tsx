"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "داشبورد" },
  { href: "/account/profile", label: "پروفایل" },
  { href: "/account/orders", label: "سفارش‌ها" },
  { href: "/account/addresses", label: "آدرس‌ها" },
  { href: "/account/tickets", label: "تیکت‌ها" },
  { href: "/account/security", label: "امنیت" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGuard>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-border p-3">
          <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">حساب کاربری</p>
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm hover:bg-muted",
                  pathname === l.href && "bg-muted font-medium",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </AuthGuard>
  );
}
