using Apollo.Application.Abstractions.Platforms;
using Apollo.Application.Common.Models;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Platforms.Commands.UpdatePlatformSettings;

public sealed record UpdatePlatformSettingsCommand(
    Guid UserId,
    Guid PlatformId,
    UpdatePlatformSettingsRequest Request) : IRequest<UserPlatformDetailDto>;

public sealed class UpdatePlatformSettingsCommandValidator
    : AbstractValidator<UpdatePlatformSettingsCommand>
{
    public UpdatePlatformSettingsCommandValidator()
    {
        RuleFor(command => command.UserId)
            .NotEmpty().WithMessage("شناسه کاربر الزامی است.");

        RuleFor(command => command.PlatformId)
            .NotEmpty().WithMessage("شناسه پلتفرم الزامی است.");

        RuleFor(command => command.Request.WebsiteName)
            .NotEmpty().WithMessage("نام وبسایت الزامی است.")
            .MaximumLength(200).WithMessage("نام وبسایت نباید بیشتر از ۲۰۰ کاراکتر باشد.");

        RuleFor(command => command.Request.WebsiteLogoFileId)
            .NotEmpty().WithMessage("لوگوی وبسایت الزامی است.")
            .MaximumLength(36).WithMessage("شناسه لوگوی وبسایت معتبر نیست.");

        RuleFor(command => command.Request.AdminUsername)
            .NotEmpty().WithMessage("نام کاربری ادمین الزامی است.")
            .MaximumLength(100).WithMessage("نام کاربری ادمین نباید بیشتر از ۱۰۰ کاراکتر باشد.");

        RuleFor(command => command.Request.AdminPassword)
            .NotEmpty().WithMessage("رمز عبور ادمین الزامی است.")
            .MaximumLength(200).WithMessage("رمز عبور ادمین نباید بیشتر از ۲۰۰ کاراکتر باشد.");

        RuleFor(command => command.Request.TemplateCode)
            .NotEmpty().WithMessage("قالب سایت الزامی است.")
            .MaximumLength(100).WithMessage("کد قالب نباید بیشتر از ۱۰۰ کاراکتر باشد.");
    }
}

public sealed class UpdatePlatformSettingsCommandHandler
    : IRequestHandler<UpdatePlatformSettingsCommand, UserPlatformDetailDto>
{
    private readonly IUserPlatformService _userPlatformService;

    public UpdatePlatformSettingsCommandHandler(IUserPlatformService userPlatformService)
    {
        _userPlatformService = userPlatformService;
    }

    public Task<UserPlatformDetailDto> Handle(
        UpdatePlatformSettingsCommand request,
        CancellationToken cancellationToken) =>
        _userPlatformService.UpdateSettingsAsync(
            request.UserId,
            request.PlatformId,
            request.Request,
            cancellationToken);
}
