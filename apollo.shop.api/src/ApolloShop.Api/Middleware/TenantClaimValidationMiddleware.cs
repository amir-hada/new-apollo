using ApolloShop.Application.Abstractions;

namespace ApolloShop.Api.Middleware;

/// <summary>Rejects authenticated requests whose tenant_id claim does not match the resolved tenant.</summary>
public class TenantClaimValidationMiddleware
{
    private readonly RequestDelegate _next;

    public TenantClaimValidationMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
    {
        if (tenantContext.IsResolved && context.User.Identity?.IsAuthenticated == true)
        {
            var claim = context.User.FindFirst(TenantClaimTypes.TenantId)?.Value;
            if (claim is not null && (!Guid.TryParse(claim, out var claimTenantId) || claimTenantId != tenantContext.TenantId))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/problem+json";
                await context.Response.WriteAsJsonAsync(new
                {
                    status = StatusCodes.Status403Forbidden,
                    title = "Forbidden",
                    detail = "The access token does not belong to the current tenant.",
                    instance = context.Request.Path.Value
                });
                return;
            }
        }

        await _next(context);
    }
}
