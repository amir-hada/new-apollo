export const SITE_SETTINGS_KEY = "apolloshop.site-settings";

export type SiteSettings = {
  home: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    featuredTitle: string;
    featuredSubtitle: string;
  };
  blog: {
    title: string;
    description: string;
    postsPerPage: number;
  };
  storefront: {
    productsPerPage: number;
    defaultSort: string;
    showOutOfStock: boolean;
    showFilters: boolean;
    showBrand: boolean;
  };
  navbar: {
    brandName: string;
    showSearch: boolean;
    showCategories: boolean;
    showCart: boolean;
  };
  footer: {
    brandName: string;
    description: string;
    copyright: string;
    supportPhone: string;
    supportEmail: string;
  };
  features: {
    wishlist: boolean;
    reviews: boolean;
    tickets: boolean;
    blog: boolean;
    coupons: boolean;
    guestCheckout: boolean;
  };
  payment: {
    gateway: string;
    merchantId: string;
    sandbox: boolean;
    callbackUrl: string;
    successMessage: string;
    failureMessage: string;
  };
  logistics: {
    enabled: boolean;
    defaultMethod: string;
    flatRate: string;
    freeShippingThreshold: string;
    estimatedDaysMin: string;
    estimatedDaysMax: string;
    originProvince: string;
    originCity: string;
    codEnabled: boolean;
    codFee: string;
    customerNote: string;
    returnPolicy: string;
  };
  sms: {
    provider: string;
    apiKey: string;
    senderNumber: string;
    enabled: boolean;
    otpTemplate: string;
    orderTemplate: string;
  };
  email: {
    provider: string;
    host: string;
    port: string;
    username: string;
    password: string;
    fromName: string;
    fromAddress: string;
    enabled: boolean;
    useSsl: boolean;
  };
  roles: {
    adminLabel: string;
    managerLabel: string;
    supportLabel: string;
    customerLabel: string;
    allowCustomRoles: boolean;
  };
  permissions: {
    manageProducts: boolean;
    manageOrders: boolean;
    manageUsers: boolean;
    manageSettings: boolean;
    manageContent: boolean;
    viewReports: boolean;
  };
  application: {
    appName: string;
    appUrl: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    timezone: string;
    locale: string;
  };
};

export const defaultSiteSettings: SiteSettings = {
  home: {
    eyebrow: "ApolloShop",
    title: "فروشگاه آپولو",
    subtitle:
      "خرید آنلاین ساده، سریع و قابل اعتماد. محصولات منتخب با پشتیبانی واقعی و تجربه کاربری حرفه‌ای.",
    primaryCtaLabel: "مشاهده محصولات",
    primaryCtaHref: "/products",
    secondaryCtaLabel: "مطالب بلاگ",
    secondaryCtaHref: "/blog",
    featuredTitle: "محصولات منتخب",
    featuredSubtitle: "تازه‌ترین و پربازدیدترین کالاهای فروشگاه",
  },
  blog: {
    title: "بلاگ",
    description: "مقالات و راهنماهای فروشگاه آپولو",
    postsPerPage: 9,
  },
  storefront: {
    productsPerPage: 12,
    defaultSort: "newest",
    showOutOfStock: true,
    showFilters: true,
    showBrand: true,
  },
  navbar: {
    brandName: "فروشگاه آپولو",
    showSearch: true,
    showCategories: true,
    showCart: true,
  },
  footer: {
    brandName: "فروشگاه آپولو",
    description:
      "تجربه خرید مدرن، سریع و قابل اعتماد با تمرکز بر کیفیت محصول و پشتیبانی واقعی.",
    copyright: "ApolloShop — فروشگاه آپولو",
    supportPhone: "",
    supportEmail: "",
  },
  features: {
    wishlist: true,
    reviews: true,
    tickets: true,
    blog: true,
    coupons: true,
    guestCheckout: false,
  },
  payment: {
    gateway: "mock",
    merchantId: "",
    sandbox: true,
    callbackUrl: "/checkout/callback",
    successMessage: "پرداخت با موفقیت انجام شد.",
    failureMessage: "پرداخت ناموفق بود. دوباره تلاش کنید.",
  },
  logistics: {
    enabled: true,
    defaultMethod: "post",
    flatRate: "50000",
    freeShippingThreshold: "500000",
    estimatedDaysMin: "2",
    estimatedDaysMax: "5",
    originProvince: "تهران",
    originCity: "تهران",
    codEnabled: false,
    codFee: "0",
    customerNote:
      "ارسال رایگان برای خرید بالای ۵۰۰ هزار تومان. زمان تقریبی تحویل ۲ تا ۵ روز کاری است.",
    returnPolicy:
      "در صورت آسیب کالا هنگام حمل، تا ۴۸ ساعت پس از دریافت می‌توانید مرجوعی ثبت کنید.",
  },
  sms: {
    provider: "kavenegar",
    apiKey: "",
    senderNumber: "",
    enabled: false,
    otpTemplate: "کد تأیید شما: {code}",
    orderTemplate: "سفارش {orderId} با موفقیت ثبت شد.",
  },
  email: {
    provider: "smtp",
    host: "",
    port: "587",
    username: "",
    password: "",
    fromName: "فروشگاه آپولو",
    fromAddress: "",
    enabled: false,
    useSsl: true,
  },
  roles: {
    adminLabel: "مدیر",
    managerLabel: "مدیر فروشگاه",
    supportLabel: "پشتیبانی",
    customerLabel: "مشتری",
    allowCustomRoles: false,
  },
  permissions: {
    manageProducts: true,
    manageOrders: true,
    manageUsers: true,
    manageSettings: true,
    manageContent: true,
    viewReports: true,
  },
  application: {
    appName: "فروشگاه آپولو",
    appUrl: "http://localhost:3000",
    maintenanceMode: false,
    maintenanceMessage: "فروشگاه موقتاً در دسترس نیست. لطفاً بعداً مراجعه کنید.",
    timezone: "Asia/Tehran",
    locale: "fa-IR",
  },
};

export function loadSiteSettings(): SiteSettings {
  if (typeof window === "undefined") return defaultSiteSettings;
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_KEY);
    if (!raw) return defaultSiteSettings;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      home: { ...defaultSiteSettings.home, ...(parsed.home as object) },
      blog: { ...defaultSiteSettings.blog, ...(parsed.blog as object) },
      storefront: { ...defaultSiteSettings.storefront, ...(parsed.storefront as object) },
      navbar: { ...defaultSiteSettings.navbar, ...(parsed.navbar as object) },
      footer: { ...defaultSiteSettings.footer, ...(parsed.footer as object) },
      features: { ...defaultSiteSettings.features, ...(parsed.features as object) },
      payment: { ...defaultSiteSettings.payment, ...(parsed.payment as object) },
      logistics: {
        ...defaultSiteSettings.logistics,
        ...(parsed.logistics as object),
      },
      sms: { ...defaultSiteSettings.sms, ...(parsed.sms as object) },
      email: { ...defaultSiteSettings.email, ...(parsed.email as object) },
      roles: { ...defaultSiteSettings.roles, ...(parsed.roles as object) },
      permissions: {
        ...defaultSiteSettings.permissions,
        ...(parsed.permissions as object),
      },
      application: {
        ...defaultSiteSettings.application,
        ...(parsed.application as object),
      },
    };
  } catch {
    return defaultSiteSettings;
  }
}

export function saveSiteSettings(settings: SiteSettings) {
  localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("apolloshop:site-settings"));
}
