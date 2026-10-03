using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Auth.Commands.UpdateProfile;

public sealed record UpdateProfileCommand(
    Guid UserId,
    string? FirstName,
    string? LastName,
    string? Email,
    string? NationalId,
    string? MobileNumber = null) : IRequest<UserProfileDto>;

public sealed class UpdateProfileCommandHandler
    : IRequestHandler<UpdateProfileCommand, UserProfileDto>
{
    private readonly IUserAccountService _userAccountService;

    public UpdateProfileCommandHandler(IUserAccountService userAccountService)
    {
        _userAccountService = userAccountService;
    }

    public Task<UserProfileDto> Handle(
        UpdateProfileCommand request,
        CancellationToken cancellationToken) =>
        _userAccountService.UpdateProfileAsync(
            request.UserId,
            request.FirstName,
            request.LastName,
            request.Email,
            request.NationalId,
            request.MobileNumber,
            cancellationToken);
}

public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(command => command.FirstName)
            .MaximumLength(ValidationRules.FirstNameMaxLength)
            .WithMessage("نام نباید بیشتر از ۱۰۰ کاراکتر باشد.");

        RuleFor(command => command.LastName)
            .MaximumLength(ValidationRules.LastNameMaxLength)
            .WithMessage("نام خانوادگی نباید بیشتر از ۱۰۰ کاراکتر باشد.");

        RuleFor(command => command.Email)
            .Matches(ValidationRules.EmailPattern)
            .When(command => !string.IsNullOrWhiteSpace(command.Email))
            .WithMessage("فرمت ایمیل معتبر نیست.");

        RuleFor(command => command.NationalId)
            .Matches(ValidationRules.NationalIdPattern)
            .When(command => !string.IsNullOrWhiteSpace(command.NationalId))
            .WithMessage("کد ملی باید ۱۰ رقم باشد.");

        RuleFor(command => command.MobileNumber)
            .Matches(ValidationRules.MobileNumberPattern)
            .When(command => !string.IsNullOrWhiteSpace(command.MobileNumber))
            .WithMessage("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.");
    }
}
