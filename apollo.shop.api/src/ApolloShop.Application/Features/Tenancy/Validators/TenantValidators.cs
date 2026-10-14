using ApolloShop.Application.Features.Tenancy.Commands;
using FluentValidation;

namespace ApolloShop.Application.Features.Tenancy.Validators;

public class CreateTenantCommandValidator : AbstractValidator<CreateTenantCommand>
{
    public CreateTenantCommandValidator()
    {
        RuleFor(x => x.Request.Slug).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Request.AdminEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.Request.AdminPassword).NotEmpty().MinimumLength(8);
        RuleFor(x => x.Request.AdminFirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.AdminLastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.ShopTitle).MaximumLength(200);
    }
}
