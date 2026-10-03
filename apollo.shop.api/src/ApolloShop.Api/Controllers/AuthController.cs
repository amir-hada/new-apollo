using ApolloShop.Application.Features.Authentication.Commands;
using ApolloShop.Application.Features.Authentication.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ApolloShop.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("otp/send")]
    [AllowAnonymous]
    public async Task<ActionResult<SendOtpResponse>> SendOtp([FromBody] SendPhoneOtpRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new SendPhoneOtpCommand(request.PhoneNumber), cancellationToken);
        return Ok(result);
    }

    [HttpPost("otp/verify")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> VerifyOtp([FromBody] VerifyPhoneOtpRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new VerifyPhoneOtpCommand(request.PhoneNumber, request.Code, HttpContext.Connection.RemoteIpAddress?.ToString()),
            cancellationToken);
        return Ok(result);
    }

    [HttpPost("phone-login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> PhoneLogin([FromBody] PhoneLoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new LoginWithPhonePasswordCommand(request.PhoneNumber, request.Password, HttpContext.Connection.RemoteIpAddress?.ToString()),
            cancellationToken);
        return Ok(result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new LoginCommand(request, HttpContext.Connection.RemoteIpAddress?.ToString()), cancellationToken);
        return Ok(result);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(new LogoutCommand(request.RefreshToken), cancellationToken);
        return NoContent();
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new RefreshTokenCommand(request, HttpContext.Connection.RemoteIpAddress?.ToString()), cancellationToken);
        return Ok(result);
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var token = await _mediator.Send(new ForgotPasswordCommand(request.Email), cancellationToken);
        return Ok(new { message = "If the email exists, a reset token was generated.", token });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(new ResetPasswordCommand(request.Email, request.Token, request.NewPassword), cancellationToken);
        return NoContent();
    }
}
