using Apollo.Application.Abstractions.Platforms;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Platforms.Commands.DeleteUserPlatform;

public sealed record DeleteUserPlatformCommand(
    Guid UserId,
    Guid PlatformId) : IRequest;

public sealed class DeleteUserPlatformCommandValidator
    : AbstractValidator<DeleteUserPlatformCommand>
{
    public DeleteUserPlatformCommandValidator()
    {
        RuleFor(command => command.UserId)
            .NotEmpty().WithMessage("شناسه کاربر الزامی است.");

        RuleFor(command => command.PlatformId)
            .NotEmpty().WithMessage("شناسه پلتفرم الزامی است.");
    }
}

public sealed class DeleteUserPlatformCommandHandler
    : IRequestHandler<DeleteUserPlatformCommand>
{
    private readonly IUserPlatformService _userPlatformService;

    public DeleteUserPlatformCommandHandler(IUserPlatformService userPlatformService)
    {
        _userPlatformService = userPlatformService;
    }

    public Task Handle(
        DeleteUserPlatformCommand request,
        CancellationToken cancellationToken) =>
        _userPlatformService.DeleteAsync(
            request.UserId,
            request.PlatformId,
            cancellationToken);
}
