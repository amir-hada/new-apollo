export type FooterLinkGroup = {
  title: string
  links: { label: string; href: string }[]
}

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "محصول",
    links: [
      { label: "ویژگی‌ها", href: "#features" },
      { label: "نحوه کار", href: "#how-it-works" },
      { label: "قالب‌ها", href: "#" },
      { label: "تعرفه‌ها", href: "#" },
    ],
  },
  {
    title: "شرکت",
    links: [
      { label: "درباره ما", href: "#" },
      { label: "بلاگ", href: "#" },
      { label: "فرصت‌های شغلی", href: "#" },
      { label: "تماس با ما", href: "#" },
    ],
  },
  {
    title: "پشتیبانی",
    links: [
      { label: "مرکز راهنما", href: "#" },
      { label: "مستندات", href: "#" },
      { label: "وضعیت سرویس", href: "#" },
      { label: "گزارش مشکل", href: "#" },
    ],
  },
]
