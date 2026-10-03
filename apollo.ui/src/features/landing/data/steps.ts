import { LayoutTemplate, Palette, Rocket, type LucideIcon } from "lucide-react"

export type Step = {
  icon: LucideIcon
  title: string
  description: string
}

export const steps: Step[] = [
  {
    icon: LayoutTemplate,
    title: "قالب را انتخاب کنید",
    description:
      "از میان ده‌ها قالب آماده، نزدیک‌ترین قالب به کسب‌وکار خود را برگزینید.",
  },
  {
    icon: Palette,
    title: "شخصی‌سازی کنید",
    description:
      "رنگ، فونت، محتوا و چیدمان صفحه‌ها را با سازنده دیداری مطابق سلیقه خود تغییر دهید.",
  },
  {
    icon: Rocket,
    title: "منتشر شوید",
    description:
      "با یک کلیک، پلتفرم شما همراه با دامنه و گواهی امنیتی روی اینترنت در دسترس قرار می‌گیرد.",
  },
]
