using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Models;
using Apollo.Domain.Constants;
using FluentValidation;
using MediatR;

namespace Apollo.Application.Features.Auth.Commands.SendOtp;

public sealed record SendOtpCommand(string MobileNumber, string? Purpose = null) : IRequest<SendOtpResponse>;

public sealed class SendOtpCommandHandler : IRequestHandler<SendOtpCommand, SendOtpResponse>
{
    private readonly IUserAccountService _userAccountService;

    public SendOtpCommandHandler(IUserAccountService userAccountService)
    {
        _userAccountService = userAccountService;
    }

    public Task<SendOtpResponse> Handle(
        SendOtpCommand request,
        CancellationToken cancellationToken) =>
        _userAccountService.SendOtpAsync(request.MobileNumber, cancellationToken);
}

public sealed class SendOtpCommandValidator : AbstractValidator<SendOtpCommand>
{
    public SendOtpCommandValidator()
    {
        RuleFor(command => command.MobileNumber)
            .NotEmpty().WithMessage("شماره موبایل الزامی است.")
            .Matches(ValidationRules.MobileNumberPattern)
            .WithMessage("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.");
    }
}
