using ApolloShop.Application.Features.Authentication.Commands;
using ApolloShop.Application.Features.Authentication.DTOs;
using ApolloShop.Application.Features.Authentication.Validators;
using ApolloShop.Application.Features.Orders.Commands;
using ApolloShop.Application.Features.Orders.Validators;
using ApolloShop.Application.Features.Products.Commands;
using ApolloShop.Application.Features.Products.DTOs;
using ApolloShop.Application.Features.Products.Validators;
using ApolloShop.Domain.Enums;
using FluentAssertions;
using FluentValidation.TestHelper;

namespace ApolloShop.Application.Tests;

public class SendPhoneOtpCommandValidatorTests
{
    private readonly SendPhoneOtpCommandValidator _validator = new();

    [Theory]
    [InlineData("09123456789")]
    [InlineData("+989123456789")]
    [InlineData("989123456789")]
    public void Valid_phone_passes(string phone)
    {
        _validator.TestValidate(new SendPhoneOtpCommand(phone)).ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("12345")]
    [InlineData("08123456789")]
    public void Invalid_phone_fails(string phone)
    {
        _validator.TestValidate(new SendPhoneOtpCommand(phone)).ShouldHaveValidationErrorFor(x => x.PhoneNumber);
    }
}

public class VerifyPhoneOtpCommandValidatorTests
{
    private readonly VerifyPhoneOtpCommandValidator _validator = new();

    [Fact]
    public void Valid_request_passes()
    {
        _validator.TestValidate(new VerifyPhoneOtpCommand("09123456789", "12345", null))
            .ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData("")]
    [InlineData("1234")]
    [InlineData("abcde")]
    public void Code_must_be_five_digits(string code)
    {
        _validator.TestValidate(new VerifyPhoneOtpCommand("09123456789", code, null))
            .ShouldHaveValidationErrorFor(x => x.Code);
    }
}

public class LoginWithPhonePasswordCommandValidatorTests
{
    private readonly LoginWithPhonePasswordCommandValidator _validator = new();

    [Fact]
    public void Valid_request_passes()
    {
        _validator.TestValidate(new LoginWithPhonePasswordCommand("09123456789", "Password1!", null))
            .ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Password_is_required()
    {
        _validator.TestValidate(new LoginWithPhonePasswordCommand("09123456789", "", null))
            .ShouldHaveValidationErrorFor(x => x.Password);
    }
}

public class LoginCommandValidatorTests
{
    private readonly LoginCommandValidator _validator = new();

    [Fact]
    public void Valid_request_passes()
    {
        var command = new LoginCommand(new LoginRequest("admin@apolloshop.ir", "Admin@12345"), null);
        _validator.TestValidate(command).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Email_is_required()
    {
        var command = new LoginCommand(new LoginRequest("", "password"), null);
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Request.Email);
    }

    [Fact]
    public void Password_is_required()
    {
        var command = new LoginCommand(new LoginRequest("a@b.com", ""), null);
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Request.Password);
    }
}

public class CreateOrderCommandValidatorTests
{
    private readonly CreateOrderCommandValidator _validator = new();

    [Fact]
    public void Valid_address_passes()
    {
        _validator.TestValidate(new CreateOrderCommand(Guid.NewGuid(), "note"))
            .ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Empty_address_id_fails()
    {
        _validator.TestValidate(new CreateOrderCommand(Guid.Empty, null))
            .ShouldHaveValidationErrorFor(x => x.AddressId);
    }
}

public class CreateProductCommandValidatorTests
{
    private readonly CreateProductCommandValidator _validator = new();

        private static CreateProductCommand ValidCommand() =>
        new(new CreateProductRequest(
            "Phone",
            "phone",
            "A phone",
            null,
            null,
            true,
            ProductStatus.Draft,
            1_000_000,
            null,
            0,
            false,
            false,
            null,
            1,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            null,
            null,
            null,
            null,
            null,
            null));

    [Fact]
    public void Valid_request_passes()
    {
        _validator.TestValidate(ValidCommand()).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Name_is_required()
    {
        var command = new CreateProductCommand(ValidCommand().Request with { Name = "" });
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Request.Name);
    }

    [Fact]
    public void Slug_is_required()
    {
        var command = new CreateProductCommand(ValidCommand().Request with { Slug = "" });
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Request.Slug);
    }

    [Fact]
    public void Description_is_required()
    {
        var command = new CreateProductCommand(ValidCommand().Request with { Description = "" });
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Request.Description);
    }

    [Fact]
    public void BasePrice_cannot_be_negative()
    {
        var command = new CreateProductCommand(ValidCommand().Request with { BasePrice = -1 });
        _validator.TestValidate(command).ShouldHaveValidationErrorFor(x => x.Request.BasePrice);
    }
}
