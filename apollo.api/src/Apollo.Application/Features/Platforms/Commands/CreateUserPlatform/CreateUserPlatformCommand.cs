using Apollo.Application.Abstractions.Platforms;
using Apollo.Application.Common.Models;
using Apollo.Domain.Helpers;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Platforms.Commands.CreateUserPlatform;

public sealed record CreateUserPlatformCommand(
    Guid UserId,
    CreateUserPlatformRequest Request) : IRequest<UserPlatformListItemDto>;

public sealed class CreateUserPlatformCommandValidator
    : AbstractValidator<CreateUserPlatformCommand>
{
    public CreateUserPlatformCommandValidator()
    {
        RuleFor(command => command.UserId)
            .NotEmpty().WithMessage("شناسه کاربر الزامی است.");

        RuleFor(command => command.Request.PlanId)
            .NotEmpty().WithMessage("انتخاب پلن الزامی است.");

        RuleFor(command => command.Request.Name)
            .NotEmpty().WithMessage("نام پلتفرم الزامی است.")
            .MaximumLength(200).WithMessage("نام پلتفرم نباید بیشتر از ۲۰۰ کاراکتر باشد.");

        RuleFor(command => command.Request.Slug)
            .MaximumLength(SiteSlug.MaxLength).WithMessage("آدرس سایت نباید بیشتر از ۶۳ کاراکتر باشد.");
    }
}

public sealed class CreateUserPlatformCommandHandler
    : IRequestHandler<CreateUserPlatformCommand, UserPlatformListItemDto>
{
    private readonly IUserPlatformService _userPlatformService;

    public CreateUserPlatformCommandHandler(IUserPlatformService userPlatformService)
    {
        _userPlatformService = userPlatformService;
    }

    public Task<UserPlatformListItemDto> Handle(
        CreateUserPlatformCommand request,
        CancellationToken cancellationToken) =>
        _userPlatformService.CreateAsync(
            request.UserId,
            request.Request,
            cancellationToken);
}
