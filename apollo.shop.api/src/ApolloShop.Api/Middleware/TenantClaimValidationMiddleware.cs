using System.Security.Claims;
using ApolloShop.Application.Abstractions;

namespace ApolloShop.Api.Middleware;

/// <summary>
/// When a JWT belongs to a different tenant than the current host/header,
/// treat the request as anonymous instead of hard-failing.
/// This avoids blocking login/OTP and other AllowAnonymous flows when a stale
/// cross-tenant token is still attached by the browser.
/// </summary>
public class TenantClaimValidationMiddleware
{
    private readonly RequestDelegate _next;

    public TenantClaimValidationMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
    {
        if (tenantContext.IsResolved && context.User.Identity?.IsAuthenticated == true)
        {
            var claim = context.User.FindFirst(TenantClaimTypes.TenantId)?.Value;
            var mismatched = claim is null
                || !Guid.TryParse(claim, out var claimTenantId)
                || claimTenantId != tenantContext.TenantId;

            if (mismatched)
            {
                // Drop the principal so [AllowAnonymous] works and [Authorize] returns 401.
                context.User = new ClaimsPrincipal(new ClaimsIdentity());
                context.Items["TenantTokenMismatch"] = true;
            }
        }

        await _next(context);
    }
}
