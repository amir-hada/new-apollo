import {
  Blocks,
  ChartLine,
  CloudUpload,
  MousePointerClick,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react"

export type Feature = {
  icon: LucideIcon
  title: string
  description: string
}

export const features: Feature[] = [
  {
    icon: MousePointerClick,
    title: "سازنده دیداری",
    description:
      "صفحه‌های پلتفرم خود را با کشیدن و رها کردن اجزا طراحی کنید؛ بدون حتی یک خط کد.",
  },
  {
    icon: Blocks,
    title: "قالب‌های آماده",
    description:
      "ده‌ها قالب حرفه‌ای برای فروشگاه، آموزش آنلاین، رزرو نوبت و خدمات؛ فقط انتخاب کنید و شروع کنید.",
  },
  {
    icon: CloudUpload,
    title: "انتشار با یک کلیک",
    description:
      "دامنه، میزبانی و گواهی امنیتی به‌صورت خودکار تنظیم می‌شود؛ شما فقط دکمه انتشار را می‌زنید.",
  },
  {
    icon: ShieldCheck,
    title: "امنیت سازمانی",
    description:
      "رمزنگاری سرتاسری، پشتیبان‌گیری خودکار روزانه و محافظت در برابر حملات، به‌صورت پیش‌فرض فعال است.",
  },
  {
    icon: ChartLine,
    title: "تحلیل لحظه‌ای",
    description:
      "بازدید، فروش و رفتار کاربران را همان لحظه در داشبورد تحلیلی آپولو دنبال کنید.",
  },
  {
    icon: Users,
    title: "همکاری تیمی",
    description:
      "اعضای تیم را دعوت کنید، سطح دسترسی هر نفر را مشخص کنید و هم‌زمان روی یک پروژه کار کنید.",
  },
]
