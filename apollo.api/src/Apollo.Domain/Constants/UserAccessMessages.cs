namespace Apollo.Domain.Constants;

public static class UserAccessMessages
{
    public const string AccountDeactivated =
        "دسترسی شما غیرفعال شده است. لطفاً با پشتیبانی تماس بگیرید.";

    public const string CannotModifySelf = "امکان انجام این عملیات روی حساب خودتان وجود ندارد.";

    public const string CannotDeleteLastAdmin = "حداقل یک مدیر سیستم باید فعال باقی بماند.";

    public const string UserDeleted = "کاربر با موفقیت حذف شد.";

    public const string UserActivated = "کاربر با موفقیت فعال شد.";

    public const string UserDeactivated = "کاربر با موفقیت غیرفعال شد.";
}
