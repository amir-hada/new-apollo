namespace ApolloShop.Application.Features.ShopSettings;

/// <summary>Default storefront category templates per shop industry.</summary>
public static class ShopIndustryCatalog
{
    public sealed record CategoryTemplate(string Suffix, string Name, string? Description = null);

    public static string BuildSlug(string industryKey, string suffix) =>
        $"ind-{industryKey.Trim().ToLowerInvariant()}-{suffix.Trim().ToLowerInvariant()}";

    public static bool IsIndustrySlug(string? slug) =>
        !string.IsNullOrWhiteSpace(slug)
        && slug.StartsWith("ind-", StringComparison.OrdinalIgnoreCase);

    public static IReadOnlyList<CategoryTemplate> GetCategories(string? industryKey)
    {
        var key = ShopIndustryKeys.Normalize(industryKey) ?? ShopIndustryKeys.General;
        return Catalog.TryGetValue(key, out var list) ? list : Catalog[ShopIndustryKeys.General];
    }

    private static readonly Dictionary<string, IReadOnlyList<CategoryTemplate>> Catalog =
        new(StringComparer.OrdinalIgnoreCase)
        {
            [ShopIndustryKeys.General] = WithOther(
                new("featured", "پیشنهاد ویژه", "منتخب فروشگاه"),
                new("bestsellers", "پرفروش‌ها", "محبوب‌ترین کالاها"),
                new("new", "تازه‌ها", "جدیدترین محصولات"),
                new("offers", "تخفیف‌دار", "کالاهای دارای تخفیف"),
                new("accessories", "لوازم جانبی", "اکسسوری و مکمل‌ها")),
            [ShopIndustryKeys.Mobile] = WithOther(
                new("phones", "گوشی هوشمند", "گوشی موبایل و هوشمند"),
                new("cases", "قاب و محافظ", "قاب، گلس و محافظ صفحه"),
                new("chargers", "شارژر و کابل", "شارژر، کابل و آداپتور"),
                new("audio", "هدفون و هندزفری", "هدفون، ایرپاد و هندزفری"),
                new("powerbanks", "پاوربانک", "شارژر همراه و پاوربانک")),
            [ShopIndustryKeys.Clothing] = WithOther(
                new("tees", "تیشرت و پولو", "تیشرت، پولو و لباس روزمره"),
                new("pants", "شلوار و جین", "شلوار جین و پارچه‌ای"),
                new("outerwear", "کت و هودی", "کت، هودی و بارانی"),
                new("shoes", "کفش", "کفش روزمره و رسمی"),
                new("accessories", "اکسسوری", "کلاه، کمربند و اکسسوری مد")),
            [ShopIndustryKeys.Cosmetics] = WithOther(
                new("skincare", "مراقبت پوست", "کرم، سرم و مراقبت پوست"),
                new("makeup", "آرایش صورت", "رژ، کرم‌پودر و سایه"),
                new("hair", "مراقبت مو", "شامپو، ماسک و روغن مو"),
                new("perfume", "عطر و ادکلن", "عطر زنانه و مردانه"),
                new("hygiene", "بهداشت شخصی", "بهداشت و مراقبت روزانه")),
            [ShopIndustryKeys.Home] = WithOther(
                new("kitchen", "آشپزخانه", "لوازم پخت و سرو"),
                new("cleaning", "نظافت", "جارو و ابزار نظافت"),
                new("lighting", "روشنایی", "لامپ و آباژور"),
                new("decor", "دکوراسیون", "دکور و تزئینات خانه"),
                new("storage", "انبارداری", "باکس و نظم‌دهنده")),
            [ShopIndustryKeys.Sports] = WithOther(
                new("fitness", "تناسب اندام", "دمبل، مت و تجهیزات ورزشی"),
                new("running", "دویدن", "کفش و لوازم دویدن"),
                new("ball", "توپ و راکت", "ورزش‌های توپی و راکتی"),
                new("camping", "کمپینگ", "چادر و تجهیزات outdoor"),
                new("bike", "دوچرخه", "دوچرخه و لوازم جانبی")),
            [ShopIndustryKeys.Books] = WithOther(
                new("fiction", "رمان و داستان", "رمان و مجموعه داستان"),
                new("selfhelp", "توسعه فردی", "کتاب‌های رشد فردی"),
                new("kids", "کودک و نوجوان", "کتاب کودک و نوجوان"),
                new("stationery", "لوازم تحریر", "دفتر، خودکار و تحریر"),
                new("art", "هنر و طراحی", "لوازم هنر و اسکچ")),
            [ShopIndustryKeys.Food] = WithOther(
                new("snacks", "تنقلات", "آجیل، چیپس و شکلات"),
                new("drinks", "نوشیدنی", "چای، قهوه و نوشیدنی"),
                new("breakfast", "صبحانه", "عسل، مربا و صبحانه"),
                new("spices", "ادویه و چاشنی", "ادویه و چاشنی آشپزی"),
                new("organic", "ارگانیک", "محصولات ارگانیک")),
            [ShopIndustryKeys.Kids] = WithOther(
                new("toys", "اسباب‌بازی", "اسباب‌بازی و سرگرمی"),
                new("clothes", "پوشاک کودک", "لباس کودک و نوزاد"),
                new("baby", "لوازم نوزاد", "سیسمونی و لوازم نوزاد"),
                new("hygiene", "بهداشت کودک", "پوشک و بهداشت کودک"),
                new("learn", "آموزشی", "کتاب و ابزار آموزشی")),
            [ShopIndustryKeys.Digital] = WithOther(
                new("laptops", "لپ‌تاپ و تبلت", "لپ‌تاپ، تبلت و الترابوک"),
                new("monitors", "مانیتور", "مانیتور اداری و گیمینگ"),
                new("peripherals", "کیبورد و ماوس", "لوازم جانبی کامپیوتر"),
                new("network", "شبکه و ذخیره‌سازی", "روتر، SSD و فلش"),
                new("gaming", "گیمینگ", "هدست، دسته‌بازی و گیمینگ")),
            [ShopIndustryKeys.Jewelry] = WithOther(
                new("necklace", "گردنبند", "گردنبند و پلاک"),
                new("bracelet", "دستبند", "دستبند و کاف"),
                new("earrings", "گوشواره", "گوشواره و پیرسینگ"),
                new("rings", "انگشتر", "انگشتر زنانه و مردانه"),
                new("sets", "ست هدیه", "ست زیورآلات هدیه")),
        };

    public const string OtherSuffix = "other";

    /// <summary>Core industry categories without the catch-all «سایر».</summary>
    public static IReadOnlyList<CategoryTemplate> GetCoreCategories(string? industryKey) =>
        GetCategories(industryKey)
            .Where(c => !string.Equals(c.Suffix, OtherSuffix, StringComparison.OrdinalIgnoreCase))
            .ToList();

    private static IReadOnlyList<CategoryTemplate> WithOther(params CategoryTemplate[] items) =>
        items
            .Concat(
            [
                new(
                    OtherSuffix,
                    "سایر",
                    "کالاهایی که در دسته‌های بالا جا نمی‌گیرند — ادمین می‌تواند اینجا یا دسته‌های سفارشی خودش استفاده کند"),
            ])
            .ToList();
}
