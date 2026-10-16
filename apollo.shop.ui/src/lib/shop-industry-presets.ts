export type ShopIndustryKey =
  | "general"
  | "cosmetics"
  | "mobile"
  | "clothing"
  | "home"
  | "sports"
  | "books"
  | "food"
  | "kids"
  | "digital"
  | "jewelry";

export type ShopNavIconKey =
  | "briefcase"
  | "gift"
  | "package"
  | "creditCard"
  | "coins"
  | "shirt"
  | "ruler"
  | "percent"
  | "sparkles"
  | "smartphone"
  | "shield"
  | "truck"
  | "bookOpen"
  | "utensils"
  | "baby"
  | "laptop"
  | "gem"
  | "dumbbell"
  | "home"
  | "heart";

export type ShopHeaderNavItem = {
  href: string;
  label: string;
  icon: ShopNavIconKey;
  badge?: string;
};

export type ShopGuideSection = {
  heading: string;
  body: string;
  /** Optional markdown-ish table rows: header + body rows */
  table?: { headers: string[]; rows: string[][] };
};

export type ShopGuidePage = {
  slug: string;
  title: string;
  description: string;
  sections: ShopGuideSection[];
};

export type ShopIndustryPreset = {
  key: ShopIndustryKey;
  title: string;
  description: string;
  headerNav: ShopHeaderNavItem[];
  categoryIcons: ShopNavIconKey[];
  guides: ShopGuidePage[];
  returnNote: string;
  warranty: string;
  deliveryTitle: string;
  deliveryLines: string[];
};

const GENERAL: ShopIndustryPreset = {
  key: "general",
  title: "عمومی",
  description: "فروشگاه چندمنظوره بدون تخصص خاص",
  headerNav: [
    { href: "/products?sort=newest", label: "پیشنهاد ویژه", icon: "percent" },
    {
      href: "/products?sort=featured",
      label: "پرفروش‌ها",
      icon: "package",
      badge: "داغ",
    },
    { href: "/guides/gift-card", label: "کارت هدیه", icon: "gift" },
    { href: "/blog", label: "مجله فروشگاه", icon: "bookOpen" },
  ],
  categoryIcons: ["package", "gift", "percent", "sparkles", "home", "heart"],
  guides: [
    {
      slug: "gift-card",
      title: "کارت هدیه",
      description: "راهنمای خرید و استفاده از کارت هدیه فروشگاه",
      sections: [
        {
          heading: "چطور کار می‌کند؟",
          body: "کارت هدیه را خریداری می‌کنید و کد آن را برای گیرنده می‌فرستید. گیرنده هنگام پرداخت در سبد خرید، کد را وارد می‌کند.",
        },
        {
          heading: "شرایط استفاده",
          body: "کارت هدیه فقط در همین فروشگاه معتبر است، قابل نقد شدن نیست و پس از انقضا قابل تمدید نیست مگر اعلام رسمی فروشگاه.",
        },
      ],
    },
  ],
  returnNote:
    "امکان مرجوعی کالا تا ۷ روز پس از تحویل، در صورت سالم بودن کالا و بسته‌بندی.",
  warranty: "تضمین اصالت و سلامت فیزیکی کالا",
  deliveryTitle: "روش‌های ارسال",
  deliveryLines: [
    "ارسال عادی · وابسته به آدرس و سبد",
    "ارسال سریع پس از ثبت سفارش",
  ],
};

const PRESETS: Record<ShopIndustryKey, ShopIndustryPreset> = {
  general: GENERAL,

  clothing: {
    key: "clothing",
    title: "پوشاک",
    description: "لباس، کفش و اکسسوری مد",
    headerNav: [
      {
        href: "/products?sort=newest",
        label: "تازه‌ها",
        icon: "sparkles",
        badge: "جدید",
      },
      { href: "/guides/size-guide", label: "راهنمای سایز", icon: "ruler" },
      {
        href: "/products?sort=featured",
        label: "پرفروش‌ها",
        icon: "shirt",
      },
      { href: "/guides/season-sale", label: "حراج فصل", icon: "percent" },
      { href: "/blog", label: "استایل و مد", icon: "bookOpen" },
    ],
    categoryIcons: ["shirt", "ruler", "sparkles", "gift", "percent", "heart"],
    guides: [
      {
        slug: "size-guide",
        title: "راهنمای سایز",
        description: "جدول سایزبندی لباس و کفش برای انتخاب دقیق‌تر",
        sections: [
          {
            heading: "چطور اندازه بگیریم؟",
            body: "با متر پارچه‌ای، دور سینه، کمر و باسن را در حالت عادی اندازه بگیرید. برای شلوار، قد فاق تا زمین را هم یادداشت کنید. اعداد را با جدول زیر مقایسه کنید.",
          },
          {
            heading: "سایز لباس (سانتی‌متر)",
            body: "مقادیر تقریبی است؛ در صفحه هر محصول ممکن است جدول اختصاصی برند آمده باشد.",
            table: {
              headers: ["سایز", "سینه", "کمر", "باسن"],
              rows: [
                ["S", "۸۶–۹۰", "۷۰–۷۴", "۹۰–۹۴"],
                ["M", "۹۰–۹۴", "۷۴–۷۸", "۹۴–۹۸"],
                ["L", "۹۴–۹۸", "۷۸–۸۲", "۹۸–۱۰۲"],
                ["XL", "۹۸–۱۰۴", "۸۲–۸۸", "۱۰۲–۱۰۸"],
                ["XXL", "۱۰۴–۱۱۰", "۸۸–۹۴", "۱۰۸–۱۱۴"],
              ],
            },
          },
          {
            heading: "سایز کفش (EU)",
            body: "طول کف پا را روی کاغذ علامت بزنید و با جدول مقایسه کنید.",
            table: {
              headers: ["EU", "طول پا (سانتی‌متر)"],
              rows: [
                ["۳۹", "۲۴٫۵"],
                ["۴۰", "۲۵"],
                ["۴۱", "۲۶"],
                ["۴۲", "۲۶٫۵"],
                ["۴۳", "۲۷٫۵"],
                ["۴۴", "۲۸"],
              ],
            },
          },
          {
            heading: "تعویض سایز",
            body: "اگر سایز مناسب نبود، تا ۷ روز در صورت موجودی می‌توانید درخواست تعویض ثبت کنید؛ کالا باید استفاده نشده و با برچسب باشد.",
          },
        ],
      },
      {
        slug: "season-sale",
        title: "حراج فصل",
        description: "شرایط شرکت در حراج و تخفیف‌های فصلی",
        sections: [
          {
            heading: "کالاهای حراجی",
            body: "محصولات حراج در فهرست محصولات با برچسب تخفیف مشخص می‌شوند. موجودی حراج محدود است و به‌محض اتمام، قیمت به حالت عادی برمی‌گردد.",
          },
          {
            heading: "مرجوعی کالای حراجی",
            body: "کالای حراجی هم مشمول شرایط مرجوعی پوشاک است، مگر در صفحه محصول خلاف آن نوشته شده باشد.",
          },
        ],
      },
    ],
    returnNote:
      "پوشاک تا ۷ روز قابل مرجوعی است، به شرط آنکه استفاده نشده، برچسب و بسته‌بندی سالم باشد و بوی عطر/لکه نداشته باشد.",
    warranty: "ضمانت کیفیت دوخت و تطابق با مشخصات اعلام‌شده",
    deliveryTitle: "ارسال پوشاک",
    deliveryLines: [
      "ارسال با بسته‌بندی ضدچروک",
      "تعویض سایز تا ۷ روز در صورت موجودی",
    ],
  },

  mobile: {
    key: "mobile",
    title: "موبایل و لوازم جانبی",
    description: "گوشی، قاب، شارژر و گجت",
    headerNav: [
      { href: "/products?sort=newest", label: "گوشی‌های روز", icon: "smartphone" },
      {
        href: "/products?sort=featured",
        label: "لوازم جانبی",
        icon: "package",
      },
      { href: "/guides/authenticity", label: "گارانتی اصالت", icon: "shield" },
      { href: "/guides/installments", label: "خرید اقساطی", icon: "creditCard" },
      { href: "/blog", label: "راهنمای خرید", icon: "bookOpen" },
    ],
    categoryIcons: [
      "smartphone",
      "package",
      "shield",
      "laptop",
      "creditCard",
      "sparkles",
    ],
    guides: [
      {
        slug: "authenticity",
        title: "گارانتی و اصالت کالا",
        description: "شرایط گارانتی، رجیستری و سلامت فیزیکی",
        sections: [
          {
            heading: "اصالت کالا",
            body: "تمام گوشی‌ها و گجت‌ها با فاکتور رسمی فروشگاه عرضه می‌شوند. در صورت وجود گارانتی شرکتی، کارت/کد گارانتی داخل جعبه یا در فاکتور درج می‌شود.",
          },
          {
            heading: "رجیستری",
            body: "وضعیت رجیستری طبق قوانین جاری کشور هنگام فروش اعلام می‌شود. مسئولیت فعال‌سازی با شماره خریدار است.",
          },
          {
            heading: "مرجوعی",
            body: "فقط کالای پلمب با جعبه و لوازم کامل تا ۷ روز پس از تحویل قابل بررسی مرجوعی است.",
          },
        ],
      },
      {
        slug: "installments",
        title: "خرید اقساطی",
        description: "شرایط و مراحل خرید اقساطی",
        sections: [
          {
            heading: "چه کسانی می‌توانند؟",
            body: "خرید اقساطی برای سفارش‌های واجد شرایط و پس از تأیید هویت/اعتبار فعال می‌شود. جزئیات اقساط در مرحله پرداخت نمایش داده می‌شود.",
          },
          {
            heading: "نکته",
            body: "در حال حاضر ممکن است فقط بخشی از محصولات مشمول اقساط باشند؛ در صورت غیرفعال بودن، گزینه در پرداخت دیده نمی‌شود.",
          },
        ],
      },
    ],
    returnNote:
      "مرجوعی موبایل و گجت تنها در صورت پلمب‌بودن کالا، سالم بودن جعبه و لوازم جانبی و حداکثر ۷ روز پس از تحویل پذیرفته می‌شود.",
    warranty: "گارانتی اصالت کالا و سلامت فیزیکی · رجیستری طبق قوانین",
    deliveryTitle: "ارسال موبایل و گجت",
    deliveryLines: [
      "ارسال امن با بیمه مرسوله",
      "تحویل حضوری / پیک ویژه برای سفارش‌های حساس",
    ],
  },

  cosmetics: {
    key: "cosmetics",
    title: "آرایشی و بهداشتی",
    description: "مراقبت پوست، آرایش و بهداشت",
    headerNav: [
      { href: "/products?sort=newest", label: "تازه‌واردها", icon: "sparkles" },
      { href: "/products", label: "مراقبت پوست", icon: "heart" },
      {
        href: "/products?sort=featured",
        label: "پرفروش بیوتی",
        icon: "package",
      },
      { href: "/guides/gift-sets", label: "ست‌های هدیه", icon: "gift" },
      { href: "/blog", label: "مجله زیبایی", icon: "bookOpen" },
    ],
    categoryIcons: ["heart", "sparkles", "gift", "package", "percent", "bookOpen"],
    guides: [
      {
        slug: "gift-sets",
        title: "ست‌های هدیه",
        description: "انتخاب و ارسال ست‌های آرایشی به عنوان هدیه",
        sections: [
          {
            heading: "بسته‌بندی هدیه",
            body: "برای سفارش‌های ست هدیه می‌توانید در توضیحات سفارش درخواست بسته‌بندی هدیه بدهید.",
          },
          {
            heading: "بهداشت و مرجوعی",
            body: "محصولات بازشده به دلایل بهداشتی مرجوع نمی‌شوند؛ فقط کالای پلمب طبق شرایط فروشگاه.",
          },
        ],
      },
    ],
    returnNote:
      "به دلایل بهداشتی، محصولات آرایشی و بهداشتی بازشده قابل مرجوعی نیستند؛ فقط کالای پلمب و استفاده‌نشده تا ۳ روز پس از تحویل.",
    warranty: "تضمین تاریخ انقضا و اصالت برند",
    deliveryTitle: "ارسال بیوتی",
    deliveryLines: [
      "بسته‌بندی محافظ در برابر ضربه و نور",
      "ارسال سریع برای محصولات حساس به دما",
    ],
  },

  home: {
    key: "home",
    title: "لوازم خانگی",
    description: "آشپزخانه، نظافت و دکوراسیون",
    headerNav: [
      { href: "/products", label: "آشپزخانه", icon: "home" },
      {
        href: "/products?sort=featured",
        label: "پرفروش خانه",
        icon: "package",
      },
      { href: "/guides/installation", label: "نصب و راه‌اندازی", icon: "truck" },
      { href: "/guides/warranty", label: "گارانتی کالا", icon: "shield" },
      { href: "/blog", label: "ایده‌های خانه", icon: "bookOpen" },
    ],
    categoryIcons: ["home", "package", "truck", "shield", "sparkles", "gift"],
    guides: [
      {
        slug: "installation",
        title: "نصب و راه‌اندازی",
        description: "شرایط نصب لوازم خانگی پس از خرید",
        sections: [
          {
            heading: "کدام کالاها نصب دارند؟",
            body: "برای برخی کالاهای بزرگ، پس از ثبت سفارش با شما برای زمان نصب هماهنگ می‌شود. هزینه نصب در صورت وجود، در صفحه محصول یا فاکتور مشخص است.",
          },
        ],
      },
      {
        slug: "warranty",
        title: "گارانتی کالا",
        description: "گارانتی شرکتی و سلامت فیزیکی هنگام تحویل",
        sections: [
          {
            heading: "گارانتی شرکتی",
            body: "مدت و مراکز خدمات پس از فروش روی کارت گارانتی یا صفحه محصول درج می‌شود.",
          },
          {
            heading: "سلامت هنگام تحویل",
            body: "جعبه را مقابل پیک باز کنید؛ در صورت آسیب ظاهری، از تحویل خودداری و به پشتیبانی اطلاع دهید.",
          },
        ],
      },
    ],
    returnNote:
      "لوازم خانگی تا ۷ روز قابل مرجوعی است اگر نصب/استفاده نشده باشد و کارتن و لوازم جانبی کامل باشد.",
    warranty: "گارانتی شرکتی + تضمین سلامت فیزیکی هنگام تحویل",
    deliveryTitle: "ارسال و نصب",
    deliveryLines: [
      "ارسال عادی یا باربری برای کالاهای حجیم",
      "هماهنگی نصب برای برخی کالاها پس از ثبت سفارش",
    ],
  },

  sports: {
    key: "sports",
    title: "ورزشی",
    description: "تناسب اندام، دویدن و outdoor",
    headerNav: [
      { href: "/products", label: "تناسب اندام", icon: "dumbbell" },
      { href: "/products?sort=newest", label: "تجهیزات جدید", icon: "sparkles" },
      { href: "/guides/shoe-fit", label: "انتخاب کفش", icon: "ruler" },
      { href: "/guides/season-sale", label: "حراج ورزشی", icon: "percent" },
      { href: "/blog", label: "تمرین و تغذیه", icon: "bookOpen" },
    ],
    categoryIcons: ["dumbbell", "package", "sparkles", "percent", "shirt", "heart"],
    guides: [
      {
        slug: "shoe-fit",
        title: "راهنمای انتخاب کفش ورزشی",
        description: "نکات سایز و تناسب کفش دویدن و تمرین",
        sections: [
          {
            heading: "اندازه‌گیری",
            body: "طول پا را عصرها اندازه بگیرید (پا کمی ورم دارد). بین انگشت شست و نوک کفش حدود یک انگشت فاصله بگذارید.",
          },
          {
            heading: "تعویض",
            body: "کفش استفاده‌شده در فضای باز قابل مرجوعی نیست؛ فقط کالای نو و بدون اثر پوشیدن.",
          },
        ],
      },
      {
        slug: "season-sale",
        title: "حراج ورزشی",
        description: "شرایط تخفیف‌های فصلی لوازم ورزشی",
        sections: [
          {
            heading: "موجودی محدود",
            body: "کالاهای حراجی تا اتمام موجودی با قیمت تخفیف‌دار عرضه می‌شوند.",
          },
        ],
      },
    ],
    returnNote:
      "لوازم ورزشی تا ۷ روز قابل مرجوعی است، به شرط سالم بودن کالا و عدم استفاده در فضای باز/تمرین.",
    warranty: "تضمین کیفیت ساخت و اصالت کالا",
    deliveryTitle: "ارسال ورزشی",
    deliveryLines: [
      "ارسال عادی · وابسته به وزن مرسوله",
      "ارسال سریع برای تجهیزات سبک",
    ],
  },

  books: {
    key: "books",
    title: "کتاب و لوازم تحریر",
    description: "کتاب، دفتر و ابزار مطالعه",
    headerNav: [
      { href: "/products?sort=newest", label: "تازه‌های نشر", icon: "bookOpen" },
      {
        href: "/products?sort=featured",
        label: "پرفروش‌ها",
        icon: "package",
      },
      { href: "/products", label: "لوازم تحریر", icon: "ruler" },
      { href: "/guides/gift-wrap", label: "هدیه کتاب", icon: "gift" },
      { href: "/blog", label: "باشگاه مطالعه", icon: "sparkles" },
    ],
    categoryIcons: ["bookOpen", "ruler", "package", "gift", "sparkles", "percent"],
    guides: [
      {
        slug: "gift-wrap",
        title: "هدیه کتاب",
        description: "بسته‌بندی هدیه برای کتاب و تحریر",
        sections: [
          {
            heading: "درخواست بسته‌بندی",
            body: "در توضیحات سفارش بنویسید «بسته‌بندی هدیه» تا کتاب بدون فاکتور قیمت داخل بسته هدیه ارسال شود.",
          },
        ],
      },
    ],
    returnNote:
      "کتاب و تحریر تا ۷ روز قابل مرجوعی است اگر نو، بدون خط‌خوردگی و با بسته‌بندی سالم باشد.",
    warranty: "تضمین چاپ اصل و سلامت فیزیکی هنگام ارسال",
    deliveryTitle: "ارسال کتاب",
    deliveryLines: [
      "بسته‌بندی ضدضربه برای جلوگیری از خم‌شدگی",
      "ارسال عادی و پیشتاز",
    ],
  },

  food: {
    key: "food",
    title: "خوراکی و مواد غذایی",
    description: "تنقلات، نوشیدنی و مواد اولیه",
    headerNav: [
      { href: "/products?sort=newest", label: "تازه رسیده", icon: "sparkles" },
      { href: "/products", label: "ارگانیک", icon: "heart" },
      {
        href: "/products?sort=featured",
        label: "پرفروش خوراکی",
        icon: "utensils",
      },
      { href: "/guides/gift-pack", label: "پک هدیه", icon: "gift" },
      { href: "/blog", label: "دستور و نکات", icon: "bookOpen" },
    ],
    categoryIcons: ["utensils", "heart", "sparkles", "gift", "package", "truck"],
    guides: [
      {
        slug: "gift-pack",
        title: "پک هدیه خوراکی",
        description: "شرایط سفارش پک‌های هدیه مواد غذایی",
        sections: [
          {
            heading: "نگهداری",
            body: "پک‌های فاسدشدنی با ارسال سریع ارسال می‌شوند؛ بلافاصله پس از تحویل در شرایط مناسب نگهداری کنید.",
          },
        ],
      },
    ],
    returnNote:
      "مواد غذایی فاسدشدنی پس از تحویل قابل مرجوعی نیستند؛ فقط در صورت خرابی در ارسال یا مغایرت سفارش تا ۲۴ ساعت پیگیری می‌شود.",
    warranty: "تضمین تاریخ مصرف و سلامت بسته‌بندی",
    deliveryTitle: "ارسال خوراکی",
    deliveryLines: [
      "ارسال سریع برای کالاهای فاسدشدنی",
      "بسته‌بندی خنک‌کننده در صورت نیاز",
    ],
  },

  kids: {
    key: "kids",
    title: "کودک و نوزاد",
    description: "اسباب‌بازی، پوشاک و لوازم نوزاد",
    headerNav: [
      { href: "/guides/newborn-checklist", label: "سیسمونی", icon: "baby" },
      {
        href: "/products?sort=featured",
        label: "اسباب‌بازی",
        icon: "gift",
      },
      { href: "/products", label: "پوشاک کودک", icon: "shirt" },
      { href: "/guides/safety", label: "ایمنی کالا", icon: "shield" },
      { href: "/blog", label: "راهنمای والدین", icon: "bookOpen" },
    ],
    categoryIcons: ["baby", "gift", "shirt", "shield", "heart", "sparkles"],
    guides: [
      {
        slug: "newborn-checklist",
        title: "چک‌لیست سیسمونی",
        description: "اقلام ضروری برای نوزاد",
        sections: [
          {
            heading: "ضروری‌ها",
            body: "سرهمی، کلاه، شیشه شیر، پوشک، دستمال مرطوب، پستانک و ساک تعویض از اقلام پایه هستند. بر اساس فصل، پتو و لباس گرم را هم اضافه کنید.",
          },
        ],
      },
      {
        slug: "safety",
        title: "ایمنی کالاهای کودک",
        description: "نکات ایمنی اسباب‌بازی و لوازم نوزاد",
        sections: [
          {
            heading: "محدوده سنی",
            body: "همیشه برچسب محدوده سنی روی اسباب‌بازی را رعایت کنید و قطعات کوچک را از دسترس کودک زیر ۳ سال دور نگه دارید.",
          },
        ],
      },
    ],
    returnNote:
      "کالای کودک تا ۷ روز قابل مرجوعی است اگر استفاده نشده و پلمب/بسته‌بندی سالم باشد؛ اقلام بهداشتی بازشده مرجوع نمی‌شوند.",
    warranty: "تضمین استاندارد ایمنی و اصالت کالا",
    deliveryTitle: "ارسال کودک و نوزاد",
    deliveryLines: [
      "بسته‌بندی ایمن و جداگانه برای اقلام شکننده",
      "ارسال سریع سیسمونی",
    ],
  },

  digital: {
    key: "digital",
    title: "دیجیتال و کامپیوتر",
    description: "لپ‌تاپ، مانیتور و گیمینگ",
    headerNav: [
      { href: "/products", label: "لپ‌تاپ و تبلت", icon: "laptop" },
      { href: "/products", label: "گیمینگ", icon: "package" },
      { href: "/guides/warranty", label: "گارانتی رسمی", icon: "shield" },
      { href: "/guides/installments", label: "خرید اقساطی", icon: "creditCard" },
      { href: "/blog", label: "نقد و بررسی", icon: "bookOpen" },
    ],
    categoryIcons: [
      "laptop",
      "smartphone",
      "package",
      "shield",
      "creditCard",
      "sparkles",
    ],
    guides: [
      {
        slug: "warranty",
        title: "گارانتی رسمی",
        description: "شرایط گارانتی کالاهای دیجیتال",
        sections: [
          {
            heading: "فعال‌سازی گارانتی",
            body: "کارت یا کد گارانتی را نگه دارید. آسیب فیزیکی، نفوذ مایعات و دستکاری غیرمجاز معمولاً شامل گارانتی نمی‌شود.",
          },
        ],
      },
      {
        slug: "installments",
        title: "خرید اقساطی",
        description: "اقساط برای کالاهای دیجیتال واجد شرایط",
        sections: [
          {
            heading: "شرایط",
            body: "در صورت فعال بودن، گزینه‌های اقساط در مرحله پرداخت نمایش داده می‌شود.",
          },
        ],
      },
    ],
    returnNote:
      "کالای دیجیتال تا ۷ روز قابل مرجوعی است تنها با پلمب سالم، کارتن و لوازم کامل و بدون فعال‌سازی نرم‌افزاری غیرقابل بازگشت.",
    warranty: "گارانتی شرکتی معتبر + تضمین سلامت فیزیکی",
    deliveryTitle: "ارسال دیجیتال",
    deliveryLines: [
      "ارسال بیمه‌شده برای کالاهای گران‌قیمت",
      "تحویل حضوری / هماهنگی نصب در موارد خاص",
    ],
  },

  jewelry: {
    key: "jewelry",
    title: "زیورآلات",
    description: "گردنبند، دستبند و اکسسوری لوکس",
    headerNav: [
      {
        href: "/products?sort=newest",
        label: "کالکشن جدید",
        icon: "gem",
        badge: "جدید",
      },
      { href: "/guides/gift-jewelry", label: "هدیه خاص", icon: "gift" },
      {
        href: "/products?sort=featured",
        label: "پرفروش‌ها",
        icon: "sparkles",
      },
      { href: "/guides/authenticity", label: "گواهی اصالت", icon: "shield" },
      { href: "/blog", label: "راهنمای انتخاب", icon: "bookOpen" },
    ],
    categoryIcons: ["gem", "gift", "sparkles", "shield", "heart", "package"],
    guides: [
      {
        slug: "gift-jewelry",
        title: "هدیه زیورآلات",
        description: "بسته‌بندی و نکات خرید هدیه",
        sections: [
          {
            heading: "بسته‌بندی",
            body: "زیورآلات در جعبه اختصاصی ارسال می‌شوند. برای پیام هدیه، در توضیحات سفارش بنویسید.",
          },
        ],
      },
      {
        slug: "authenticity",
        title: "گواهی اصالت",
        description: "اصالت جنس و شرایط نگهداری",
        sections: [
          {
            heading: "جنس و آبکاری",
            body: "مشخصات فلز/سنگ در صفحه محصول آمده است. از تماس با مواد شیمیایی و رطوبت زیاد خودداری کنید.",
          },
        ],
      },
    ],
    returnNote:
      "زیورآلات تا ۳ روز قابل مرجوعی است اگر استفاده نشده، بدون اثر خراش و با جعبه/فاکتور اصلی باشد.",
    warranty: "گواهی اصالت و ضمانت آبکاری/جنس مطابق مشخصات",
    deliveryTitle: "ارسال زیورآلات",
    deliveryLines: [
      "بسته‌بندی هدیه‌ای امن",
      "ارسال پیشتاز با بیمه مرسوله",
    ],
  },
};

export const SHOP_INDUSTRY_OPTIONS: {
  key: ShopIndustryKey;
  title: string;
  description: string;
}[] = (Object.keys(PRESETS) as ShopIndustryKey[]).map((key) => ({
  key,
  title: PRESETS[key].title,
  description: PRESETS[key].description,
}));

export function resolveShopIndustryKey(
  value?: string | null,
): ShopIndustryKey {
  if (!value) return "general";
  const key = value.trim().toLowerCase();
  return key in PRESETS ? (key as ShopIndustryKey) : "general";
}

export function getShopIndustryPreset(
  industryKey?: string | null,
): ShopIndustryPreset {
  return PRESETS[resolveShopIndustryKey(industryKey)];
}

export function getShopIndustryGuide(
  industryKey: string | null | undefined,
  slug: string,
): ShopGuidePage | null {
  const preset = getShopIndustryPreset(industryKey);
  return preset.guides.find((g) => g.slug === slug) ?? null;
}

/** قالب‌های پیشنهادی ویژگی محصول برای هر صنعت (ادمین می‌تواند تغییر/حذف کند) */
export type IndustrySpecTemplate = {
  name: string;
  /** اگر true، به‌صورت پارامتر سفارش (انتخاب خریدار) اضافه می‌شود */
  isOrderParameter: boolean;
  /** مقادیر نمونه؛ ادمین می‌تواند عوض کند */
  sampleValues: string[];
};

const INDUSTRY_SPEC_TEMPLATES: Record<ShopIndustryKey, IndustrySpecTemplate[]> = {
  general: [
    { name: "رنگ", isOrderParameter: true, sampleValues: ["مشکی", "سفید"] },
    { name: "مدل", isOrderParameter: false, sampleValues: [""] },
  ],
  clothing: [
    { name: "رنگ", isOrderParameter: true, sampleValues: ["مشکی", "سفید", "خاکستری"] },
    { name: "سایز", isOrderParameter: true, sampleValues: ["S", "M", "L", "XL"] },
    { name: "جنس", isOrderParameter: false, sampleValues: ["نخی"] },
  ],
  mobile: [
    { name: "رنگ", isOrderParameter: true, sampleValues: ["مشکی", "آبی"] },
    { name: "حافظه", isOrderParameter: true, sampleValues: ["۱۲۸ گیگابایت", "۲۵۶ گیگابایت"] },
    { name: "رم", isOrderParameter: false, sampleValues: ["۸ گیگابایت"] },
  ],
  cosmetics: [
    { name: "حجم", isOrderParameter: true, sampleValues: ["۳۰ میل", "۵۰ میل"] },
    { name: "نوع پوست", isOrderParameter: false, sampleValues: ["همه پوست‌ها"] },
  ],
  home: [
    { name: "رنگ", isOrderParameter: true, sampleValues: ["استیل", "مشکی"] },
    { name: "ظرفیت", isOrderParameter: false, sampleValues: [""] },
  ],
  sports: [
    { name: "رنگ", isOrderParameter: true, sampleValues: ["مشکی", "آبی"] },
    { name: "سایز", isOrderParameter: true, sampleValues: ["S", "M", "L"] },
  ],
  books: [
    { name: "قطع", isOrderParameter: false, sampleValues: ["رقعی"] },
    { name: "نوع جلد", isOrderParameter: true, sampleValues: ["شومیز", "گالینگور"] },
  ],
  food: [
    { name: "وزن", isOrderParameter: true, sampleValues: ["۲۵۰ گرم", "۵۰۰ گرم"] },
    { name: "طعم", isOrderParameter: true, sampleValues: ["ساده", "شور"] },
  ],
  kids: [
    { name: "رنگ", isOrderParameter: true, sampleValues: ["صورتی", "آبی"] },
    { name: "رده سنی", isOrderParameter: false, sampleValues: ["۳ سال به بالا"] },
  ],
  digital: [
    { name: "رنگ", isOrderParameter: true, sampleValues: ["نقره‌ای", "خاکستری"] },
    { name: "حافظه", isOrderParameter: true, sampleValues: ["۵۱۲ گیگابایت", "۱ ترابایت"] },
    { name: "رم", isOrderParameter: true, sampleValues: ["۱۶ گیگابایت", "۳۲ گیگابایت"] },
  ],
  jewelry: [
    { name: "رنگ", isOrderParameter: true, sampleValues: ["طلایی", "نقره‌ای"] },
    { name: "سایز", isOrderParameter: true, sampleValues: ["۱۶", "۱۷", "۱۸"] },
  ],
};

export function getIndustrySpecTemplates(
  industryKey?: string | null,
): IndustrySpecTemplate[] {
  return INDUSTRY_SPEC_TEMPLATES[resolveShopIndustryKey(industryKey)];
}
