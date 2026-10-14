using Apollo.Application.Abstractions.Platforms;
using Apollo.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Platforms.Commands.CreateShopSso;

public sealed record CreateShopSsoCommand(
    Guid UserId,
    Guid PlatformId) : IRequest<ShopSsoRedirectDto>;

public sealed class CreateShopSsoCommandValidator : AbstractValidator<CreateShopSsoCommand>
{
    public CreateShopSsoCommandValidator()
    {
        RuleFor(command => command.UserId)
            .NotEmpty().WithMessage("شناسه کاربر الزامی است.");

        RuleFor(command => command.PlatformId)
            .NotEmpty().WithMessage("شناسه پلتفرم الزامی است.");
    }
}

public sealed class CreateShopSsoCommandHandler
    : IRequestHandler<CreateShopSsoCommand, ShopSsoRedirectDto>
{
    private readonly IUserPlatformService _userPlatformService;

    public CreateShopSsoCommandHandler(IUserPlatformService userPlatformService)
    {
        _userPlatformService = userPlatformService;
    }

    public Task<ShopSsoRedirectDto> Handle(
        CreateShopSsoCommand request,
        CancellationToken cancellationToken) =>
        _userPlatformService.CreateShopSsoRedirectAsync(
            request.UserId,
            request.PlatformId,
            cancellationToken);
}
