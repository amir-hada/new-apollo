using ApolloShop.Application.Features.Orders.Commands;
using FluentValidation;

namespace ApolloShop.Application.Features.Orders.Validators;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.AddressId).NotEmpty();
    }
}
