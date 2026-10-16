using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Apollo.Api.Filters;

/// <summary>Allows shop.api (and other trusted backends) to call internal endpoints with X-Provisioning-Key.</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RequireProvisioningKeyAttribute : Attribute, IAsyncActionFilter
{
    public const string HeaderName = "X-Provisioning-Key";

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var configured = context.HttpContext.RequestServices
            .GetRequiredService<IConfiguration>()["Shop:ProvisioningKey"];

        if (string.IsNullOrWhiteSpace(configured))
        {
            context.Result = Problem(StatusCodes.Status503ServiceUnavailable, "Provisioning is not configured.");
            return;
        }

        var provided = context.HttpContext.Request.Headers[HeaderName].ToString();
        if (!FixedTimeEquals(provided, configured))
        {
            context.Result = Problem(StatusCodes.Status401Unauthorized, "Invalid provisioning key.");
            return;
        }

        await next();
    }

    private static bool FixedTimeEquals(string a, string b)
    {
        var left = SHA256.HashData(Encoding.UTF8.GetBytes(a));
        var right = SHA256.HashData(Encoding.UTF8.GetBytes(b));
        return CryptographicOperations.FixedTimeEquals(left, right);
    }

    private static ObjectResult Problem(int status, string detail) =>
        new(new ProblemDetails
        {
            Status = status,
            Title = status == 401 ? "Unauthorized" : "Service Unavailable",
            Detail = detail,
        })
        {
            StatusCode = status,
        };
}
