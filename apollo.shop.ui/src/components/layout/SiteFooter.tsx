"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ExternalLink,
  Mail,
  Phone,
  Send,
  Star,
} from "lucide-react";
import { toPersianDigits } from "@/features/auth/normalize-phone";
import { api } from "@/lib/api";
import { useShopSettings } from "@/lib/shop-settings-api";
import { useSiteSettings } from "@/lib/use-site-settings";
import { cn } from "@/lib/utils";
import type { BlogPostListItem, PagedResult } from "@/types/api";

function SocialIcon({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

const InstagramIcon = ({ className }: { className?: string }) => (
  <SocialIcon
    className={className}
    path="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
  />
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <SocialIcon
    className={className}
    path="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z"
  />
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <SocialIcon
    className={className}
    path="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"
  />
);

const mainLinks = [
  { href: "/", label: "صفحه اصلی" },
  { href: "/products", label: "محصولات" },
  { href: "/blog", label: "بلاگ" },
  { href: "/faq", label: "سوالات متداول" },
  { href: "/cart", label: "سبد خرید" },
];

const supportLinks = [
  { href: "/account", label: "حساب کاربری" },
  { href: "/account/orders", label: "پیگیری سفارش" },
  { href: "/account/tickets", label: "تیکت پشتیبانی" },
  { href: "/login", label: "ورود / ثبت‌نام" },
  { href: "/faq", label: "راهنمای خرید" },
];

const moreLinks = [
  { href: "/products?sort=featured", label: "پیشنهاد شگفت‌انگیز" },
  { href: "/products?sort=newest", label: "جدیدترین‌ها" },
  { href: "/products?sort=best_selling", label: "پرفروش‌ترین‌ها" },
  { href: "/blog", label: "مجله فروشگاه" },
  { href: "/faq", label: "قوانین و مقررات" },
];

const socials = [
  { href: "#", label: "اینستاگرام", icon: InstagramIcon },
  { href: "#", label: "لینکدین", icon: LinkedinIcon },
  { href: "#", label: "تلگرام", icon: Send },
  { href: "#", label: "یوتیوب", icon: YoutubeIcon },
] as const;

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-4 text-[14px] font-bold text-primary-foreground">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-[13px] text-primary-foreground/65 transition hover:text-primary-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const { settings } = useSiteSettings();
  const { data: shop } = useShopSettings();
  const footer = settings.footer;
  const [descOpen, setDescOpen] = useState(false);

  const brandName = shop?.shopTitle || footer.brandName;
  const description =
    shop?.description ||
    footer.description ||
    "فروشگاه اینترنتی آپولو؛ خرید آنلاین ساده، سریع و قابل اعتماد با تمرکز بر کیفیت محصول و پشتیبانی واقعی.";
  const phone = shop?.supportPhone || footer.supportPhone;
  const email = shop?.supportEmail || footer.supportEmail;
  const logoUrl = shop?.logoUrl;

  const posts = useQuery({
    queryKey: ["footer-latest-posts"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await api.get<PagedResult<BlogPostListItem>>(
        "/api/blog/posts",
        { params: { page: 1, pageSize: 3 } },
      );
      return data.items ?? [];
    },
  });

  const shortDesc = useMemo(() => {
    if (description.length <= 160) return description;
    return `${description.slice(0, 160).trim()}…`;
  }, [description]);

  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-5 lg:px-6 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* برند و تماس */}
          <div className="lg:col-span-3">
            <Link href="/" className="inline-flex items-center gap-2.5">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-9 w-auto max-w-[140px] object-contain brightness-0 invert"
                />
              ) : (
                <span className="text-lg font-extrabold tracking-tight text-primary-foreground">
                  {brandName}
                </span>
              )}
            </Link>
            <p className="mt-1.5 text-[12px] text-primary-foreground/55">
              حامی تجربه خرید آنلاین
            </p>

            <div className="mt-4 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-amber-300 text-amber-300"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-[12px] text-primary-foreground/75">
                رضایت {toPersianDigits("99.6")}٪
              </span>
            </div>

            <ul className="mt-5 space-y-2.5 text-[13px] text-primary-foreground/70">
              {phone ? (
                <li className="flex items-center gap-2">
                  <Phone className="size-3.5 shrink-0 text-primary-foreground/45" />
                  <a
                    href={`tel:${phone}`}
                    className="transition hover:text-primary-foreground"
                    dir="ltr"
                  >
                    {toPersianDigits(phone)}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li className="flex items-center gap-2">
                  <Mail className="size-3.5 shrink-0 text-primary-foreground/45" />
                  <a
                    href={`mailto:${email}`}
                    className="truncate transition hover:text-primary-foreground"
                    dir="ltr"
                  >
                    {email}
                  </a>
                </li>
              ) : (
                <li className="flex items-center gap-2 text-primary-foreground/45">
                  <Mail className="size-3.5 shrink-0" />
                  پشتیبانی آنلاین
                </li>
              )}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground/80 transition hover:border-primary-foreground/35 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* لینک‌ها */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <FooterLinkColumn title="اصلی" links={mainLinks} />
            <FooterLinkColumn title="پشتیبانی" links={supportLinks} />
            <FooterLinkColumn title="بیشتر" links={moreLinks} />
          </div>

          {/* آخرین مقالات */}
          <div className="lg:col-span-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-[14px] font-bold text-primary-foreground">
                آخرین مقالات
              </p>
              <Link
                href="/blog"
                className="text-[12px] text-primary-foreground/55 transition hover:text-primary-foreground"
              >
                مشاهده همه
              </Link>
            </div>

            <div className="space-y-3">
              {(posts.data ?? []).length > 0 ? (
                posts.data!.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex items-start gap-3 rounded-md p-1 transition hover:bg-primary-foreground/10"
                  >
                    <div className="size-14 shrink-0 overflow-hidden rounded-md bg-primary-foreground/10">
                      {post.featuredImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.featuredImageUrl}
                          alt=""
                          className="size-full object-cover transition group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[10px] text-primary-foreground/40">
                          بلاگ
                        </div>
                      )}
                    </div>
                    <p className="line-clamp-2 pt-0.5 text-[13px] leading-6 text-primary-foreground/70 transition group-hover:text-primary-foreground">
                      {post.title}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-[13px] text-primary-foreground/45">
                  هنوز مقاله‌ای برای نمایش وجود ندارد.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/15 pt-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[13px] leading-7 text-primary-foreground/60">
                {descOpen ? description : shortDesc}
              </p>
              {description.length > 160 ? (
                <button
                  type="button"
                  onClick={() => setDescOpen((v) => !v)}
                  className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-primary-foreground/80 transition hover:text-primary-foreground"
                >
                  {descOpen ? "مشاهده کمتر" : "مشاهده بیشتر"}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition",
                      descOpen && "rotate-180",
                    )}
                  />
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["نماد اعتماد", "ساماندهی", "اتحادیه", "بیشتر"].map((label, i) => (
                <div
                  key={label}
                  className={cn(
                    "inline-flex h-14 min-w-14 items-center justify-center rounded-md border border-primary-foreground/15 bg-primary-foreground/10 px-3 text-[11px] text-primary-foreground/65",
                    i === 3 && "gap-1.5",
                  )}
                >
                  {label}
                  {i === 3 ? <ExternalLink className="size-3" /> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-primary-foreground/15 pt-5 text-[12px] text-primary-foreground/45 sm:flex-row sm:items-center">
            <p>
              © {toPersianDigits(String(new Date().getFullYear()))}{" "}
              {footer.copyright || brandName}
            </p>
            <p>طراحی و توسعه فروشگاه آپولو</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
