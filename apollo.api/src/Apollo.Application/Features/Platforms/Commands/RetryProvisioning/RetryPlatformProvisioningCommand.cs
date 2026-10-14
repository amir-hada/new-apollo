using Apollo.Application.Abstractions.Platforms;
using Apollo.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Platforms.Commands.RetryProvisioning;

public sealed record RetryPlatformProvisioningCommand(
    Guid UserId,
    Guid PlatformId) : IRequest<UserPlatformDetailDto>;

public sealed class RetryPlatformProvisioningCommandValidator
    : AbstractValidator<RetryPlatformProvisioningCommand>
{
    public RetryPlatformProvisioningCommandValidator()
    {
        RuleFor(command => command.UserId)
            .NotEmpty().WithMessage("شناسه کاربر الزامی است.");

        RuleFor(command => command.PlatformId)
            .NotEmpty().WithMessage("شناسه پلتفرم الزامی است.");
    }
}

public sealed class RetryPlatformProvisioningCommandHandler
    : IRequestHandler<RetryPlatformProvisioningCommand, UserPlatformDetailDto>
{
    private readonly IUserPlatformService _userPlatformService;

    public RetryPlatformProvisioningCommandHandler(IUserPlatformService userPlatformService)
    {
        _userPlatformService = userPlatformService;
    }

    public Task<UserPlatformDetailDto> Handle(
        RetryPlatformProvisioningCommand request,
        CancellationToken cancellationToken) =>
        _userPlatformService.RetryProvisioningAsync(
            request.UserId,
            request.PlatformId,
            cancellationToken);
}
