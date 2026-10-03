using ApolloShop.Application.Features.Addresses.Commands;
using FluentValidation;

namespace ApolloShop.Application.Features.Addresses.Validators;

public class CreateAddressCommandValidator : AbstractValidator<CreateAddressCommand>
{
    public CreateAddressCommandValidator()
    {
        RuleFor(x => x.Request.Title).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Request.Phone).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Request.Province).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.PostalCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Request.Line1).NotEmpty().MaximumLength(500);
    }
}

public class UpdateAddressCommandValidator : AbstractValidator<UpdateAddressCommand>
{
    public UpdateAddressCommandValidator()
    {
        RuleFor(x => x.Request.Title).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Request.Phone).NotEmpty().MaximumLength(32);
        RuleFor(x => x.Request.Province).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.PostalCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Request.Line1).NotEmpty().MaximumLength(500);
    }
}
