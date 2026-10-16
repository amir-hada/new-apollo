using System.Text.RegularExpressions;
using ApolloShop.Application.Features.Addresses.Commands;
using ApolloShop.Application.Features.Addresses.DTOs;
using FluentValidation;

namespace ApolloShop.Application.Features.Addresses.Validators;

public class CreateAddressCommandValidator : AbstractValidator<CreateAddressCommand>
{
    public CreateAddressCommandValidator()
    {
        RuleFor(x => x.Request).SetValidator(new UpsertAddressRequestValidator());
    }
}

public class UpdateAddressCommandValidator : AbstractValidator<UpdateAddressCommand>
{
    public UpdateAddressCommandValidator()
    {
        RuleFor(x => x.Request).SetValidator(new UpsertAddressRequestValidator());
    }
}

public class UpsertAddressRequestValidator : AbstractValidator<UpsertAddressRequest>
{
    private static readonly Regex IranianMobile = new("^09\\d{9}$", RegexOptions.Compiled);
    private static readonly Regex IranianPostal = new("^\\d{10}$", RegexOptions.Compiled);

    public UpsertAddressRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("عنوان آدرس الزامی است.")
            .MaximumLength(100).WithMessage("عنوان آدرس نباید بیشتر از ۱۰۰ کاراکتر باشد.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("نام گیرنده الزامی است.")
            .MinimumLength(3).WithMessage("نام گیرنده باید حداقل ۳ کاراکتر باشد.")
            .MaximumLength(200).WithMessage("نام گیرنده نباید بیشتر از ۲۰۰ کاراکتر باشد.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("شماره موبایل الزامی است.")
            .Must(BeIranianMobile).WithMessage("شماره موبایل معتبر نیست.");

        RuleFor(x => x.Province)
            .NotEmpty().WithMessage("استان الزامی است.")
            .MaximumLength(100);

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("شهر الزامی است.")
            .MaximumLength(100);

        RuleFor(x => x.PostalCode)
            .NotEmpty().WithMessage("کد پستی الزامی است.")
            .Must(BeIranianPostalCode).WithMessage("کد پستی باید ۱۰ رقم باشد.");

        RuleFor(x => x.Line1)
            .NotEmpty().WithMessage("آدرس کامل الزامی است.")
            .MinimumLength(10).WithMessage("آدرس را کامل‌تر وارد کنید.")
            .MaximumLength(500).WithMessage("آدرس نباید بیشتر از ۵۰۰ کاراکتر باشد.");

        RuleFor(x => x.Line2)
            .MaximumLength(500)
            .When(x => !string.IsNullOrWhiteSpace(x.Line2));
    }

    private static bool BeIranianMobile(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return false;
        return IranianMobile.IsMatch(NormalizeDigits(phone));
    }

    private static bool BeIranianPostalCode(string? postal)
    {
        if (string.IsNullOrWhiteSpace(postal)) return false;
        var digits = NormalizeDigits(postal);
        return IranianPostal.IsMatch(digits) && digits != "0000000000";
    }

    private static string NormalizeDigits(string value)
    {
        var chars = value.Trim().ToCharArray();
        var buffer = new char[chars.Length];
        var len = 0;
        foreach (var c in chars)
        {
            if (c is >= '۰' and <= '۹') buffer[len++] = (char)('0' + (c - '۰'));
            else if (c is >= '٠' and <= '٩') buffer[len++] = (char)('0' + (c - '٠'));
            else if (c is >= '0' and <= '9') buffer[len++] = c;
        }
        return new string(buffer, 0, len);
    }
}
