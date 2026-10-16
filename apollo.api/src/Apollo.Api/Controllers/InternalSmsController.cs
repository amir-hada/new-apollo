using Apollo.Api.Filters;
using Apollo.Application.Abstractions.Sms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Apollo.Api.Controllers;

/// <summary>Internal SMS gateway used by apollo.shop.api (shared SMS.ir credit).</summary>
[ApiController]
[AllowAnonymous]
[Route("api/internal/sms")]
public sealed class InternalSmsController : ControllerBase
{
    private readonly ISmsSender _smsSender;

    public InternalSmsController(ISmsSender smsSender)
    {
        _smsSender = smsSender;
    }

    [HttpPost("otp")]
    [RequireProvisioningKey]
    public async Task<IActionResult> SendOtp(
        [FromBody] InternalSendOtpRequest request,
        CancellationToken cancellationToken)
    {
        await _smsSender.SendOtpAsync(request.MobileNumber, request.Code, cancellationToken);
        return Ok(new { message = "sent" });
    }

    [HttpPost("text")]
    [RequireProvisioningKey]
    public async Task<IActionResult> SendText(
        [FromBody] InternalSendTextRequest request,
        CancellationToken cancellationToken)
    {
        await _smsSender.SendTextAsync(request.MobileNumber, request.Message, cancellationToken);
        return Ok(new { message = "sent" });
    }

    [HttpPost("order")]
    [RequireProvisioningKey]
    public async Task<IActionResult> SendOrder(
        [FromBody] InternalSendOrderRequest request,
        CancellationToken cancellationToken)
    {
        await _smsSender.SendOrderAsync(
            request.MobileNumber,
            request.OrderNumber,
            request.TotalFormatted,
            cancellationToken);
        return Ok(new { message = "sent" });
    }
}

public sealed record InternalSendOtpRequest(string MobileNumber, string Code);

public sealed record InternalSendTextRequest(string MobileNumber, string Message);

public sealed record InternalSendOrderRequest(
    string MobileNumber,
    string OrderNumber,
    string TotalFormatted);
