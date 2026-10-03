using System.Security.Claims;
using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Common.Exceptions;
using Apollo.Application.Features.Admin.Queries.GetUsers;
using Apollo.Application.Features.Auth.Commands.ForgotPassword;
using Apollo.Application.Features.Auth.Commands.LoginUser;
using Apollo.Application.Features.Auth.Commands.LoginWithPhone;
using Apollo.Application.Features.Auth.Commands.LoginWithUsername;
using Apollo.Application.Features.Auth.Commands.RegisterUser;
using Apollo.Application.Features.Auth.Commands.RegisterWithPhone;
using Apollo.Application.Features.Auth.Commands.VerifyPhone;
using Apollo.Application.Features.Auth.Commands.SendOtp;
using Apollo.Application.Features.Auth.Commands.UpdateProfile;
using Apollo.Application.Features.Auth.Queries.GetCurrentUser;
using Apollo.Application.Features.Auth.Queries.GetLoginHistory;
using Apollo.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Apollo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly ISender _sender;
    private readonly ILoginHistoryService _loginHistoryService;

    public AuthController(ISender sender, ILoginHistoryService loginHistoryService)
    {
        _sender = sender;
        _loginHistoryService = loginHistoryService;
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterUserCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(command, cancellationToken);
        await RecordLoginAsync(response.UserId, cancellationToken);
        return Created("/api/auth/me", response);
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login(
        [FromBody] LoginUserCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(command, cancellationToken);
        await RecordLoginAsync(response.UserId, cancellationToken);
        return Ok(response);
    }

    [HttpPost("login/username")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> LoginWithUsername(
        [FromBody] LoginWithUsernameCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(command, cancellationToken);

        if (!response.Roles.Contains(AppRoles.Admin, StringComparer.OrdinalIgnoreCase))
        {
            throw new UnauthorizedException("دسترسی پنل مدیریت فقط برای مدیران سیستم مجاز است.");
        }

        await RecordLoginAsync(response.UserId, cancellationToken);
        return Ok(response);
    }

    [HttpPost("otp/send")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> SendOtp(
        [FromBody] SendOtpCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(command, cancellationToken);
        return Ok(response);
    }

    [HttpPost("login/phone")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> LoginWithPhone(
        [FromBody] LoginWithPhoneCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(command, cancellationToken);
        await RecordLoginAsync(response.UserId, cancellationToken);
        return Ok(response);
    }

    [HttpPost("verify/phone")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> VerifyPhone(
        [FromBody] VerifyPhoneCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(command, cancellationToken);
        await RecordLoginAsync(response.UserId, cancellationToken);
        return Ok(response);
    }

    [HttpPost("register/phone")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> RegisterWithPhone(
        [FromBody] RegisterWithPhoneCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(command, cancellationToken);
        await RecordLoginAsync(response.UserId, cancellationToken);
        return Created("/api/auth/me", response);
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordCommand command,
        CancellationToken cancellationToken)
    {
        var response = await _sender.Send(command, cancellationToken);
        return Ok(response);
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var profile = await _sender.Send(new GetCurrentUserQuery(userId), cancellationToken);
        return Ok(profile);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var profile = await _sender.Send(
            new UpdateProfileCommand(
                userId,
                request.FirstName,
                request.LastName,
                request.Email,
                request.NationalId,
                request.MobileNumber),
            cancellationToken);

        return Ok(profile);
    }

    [HttpGet("me/login-history")]
    [Authorize]
    public async Task<IActionResult> GetLoginHistory(
        [FromQuery] int count = 5,
        CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var history = await _sender.Send(new GetLoginHistoryQuery(userId, count), cancellationToken);
        return Ok(history);
    }

    private Guid GetUserId()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedException("کاربر احراز هویت نشده است.");
        }

        return userId;
    }

    private Task RecordLoginAsync(Guid userId, CancellationToken cancellationToken)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        return _loginHistoryService.RecordLoginAsync(
            userId,
            ipAddress,
            userAgent,
            cancellationToken);
    }
}
