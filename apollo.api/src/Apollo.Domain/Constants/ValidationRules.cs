namespace Apollo.Domain.Constants;

public static class ValidationRules
{
    public const int PasswordMinLength = 8;
    public const int FirstNameMaxLength = 100;
    public const int LastNameMaxLength = 100;
    public const int NationalIdLength = 10;
    public const int MobileNumberLength = 11;
    public const int ProfilePictureUrlMaxLength = 2048;

    public const string PasswordPattern =
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$";

    public const string EmailPattern =
        @"^[^\s@]+@[^\s@]+\.[^\s@]+$";

    public const string MobileNumberPattern = @"^09\d{9}$";

    public const string NationalIdPattern = @"^\d{10}$";

    public const string UsernamePattern = @"^[a-zA-Z0-9_]+$";

    public const string OtpPattern = @"^\d{5}$";

    public const string OtpPurposeLogin = "login";

    public const string OtpPurposeRegister = "register";

    public const string OtpPurposeAuth = "auth";

    public const string MasterOtpCode = "12345";
}
