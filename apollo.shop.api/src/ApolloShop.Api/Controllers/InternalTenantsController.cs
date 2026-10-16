using ApolloShop.Api.Filters;
using ApolloShop.Application.Features.Authentication.DTOs;
using ApolloShop.Application.Features.Tenancy.Commands;
using ApolloShop.Application.Features.Tenancy.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ApolloShop.Api.Controllers;

/// <summary>Internal endpoints used only by the Apollo platform API (guarded by X-Provisioning-Key).</summary>
[ApiController]
[AllowAnonymous]
[Route("api/internal")]
public class InternalTenantsController : ControllerBase
{
    private readonly IMediator _mediator;

    public InternalTenantsController(IMediator mediator) => _mediator = mediator;

    [HttpPost("tenants")]
    [RequireProvisioningKey]
    public async Task<ActionResult<CreateTenantResultDto>> Create(
        [FromBody] CreateTenantRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new CreateTenantCommand(request), cancellationToken));

    [HttpPost("tenants/{slug}/sso-code")]
    [RequireProvisioningKey]
    public async Task<ActionResult<InternalSsoCodeResultDto>> CreateSsoCode(
        string slug,
        [FromBody] InternalSsoCodeRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new CreateSsoCodeCommand(slug, request.Email), cancellationToken));

    [HttpPatch("tenants/{slug}/status")]
    [RequireProvisioningKey]
    public async Task<ActionResult<TenantDto>> SetStatus(
        string slug,
        [FromBody] SetTenantActiveRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(new SetTenantActiveCommand(slug, request.IsActive), cancellationToken));

    [HttpDelete("tenants/{slug}")]
    [RequireProvisioningKey]
    public async Task<IActionResult> Delete(
        string slug,
        CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteTenantCommand(slug), cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Called by the shop admin UI after the Apollo redirect. The one-time code is the credential,
    /// so no provisioning key is required (the browser must not hold it).
    /// </summary>
    [HttpPost("sso/exchange")]
    [EnableRateLimiting("auth")]
    public async Task<ActionResult<AuthResponse>> Exchange(
        [FromBody] InternalSsoExchangeRequest request,
        CancellationToken cancellationToken) =>
        Ok(await _mediator.Send(
            new ExchangeSsoCodeCommand(request.Code, HttpContext.Connection.RemoteIpAddress?.ToString()),
            cancellationToken));
}
