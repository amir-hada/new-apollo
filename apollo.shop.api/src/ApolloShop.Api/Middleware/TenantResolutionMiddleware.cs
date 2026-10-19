using System.Net;
using System.Text.RegularExpressions;
using ApolloShop.Application.Abstractions;
using ApolloShop.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace ApolloShop.Api.Middleware;

public partial class TenantResolutionMiddleware
{
    public const string HeaderName = "X-Tenant-Slug";

    private static readonly string[] ReservedSubdomains = ["www", "api", "localhost"];

    private readonly RequestDelegate _next;

    public TenantResolutionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext, IApplicationDbContext db)
    {
        if (ShouldSkip(context.Request))
        {
            await _next(context);
            return;
        }

        var tenant = await ResolveTenantAsync(context, db);
        tenantContext.Set(tenant.Id, tenant.Slug);

        await _next(context);
    }

    private static bool ShouldSkip(HttpRequest request)
    {
        if (HttpMethods.IsOptions(request.Method))
        {
            return true;
        }

        var path = request.Path;
        // Internal platform endpoints address tenants explicitly (slug / one-time code), not by request host.
        // Static media is public and must not require a tenant host/header (img tags cannot send X-Tenant-Slug).
        return path.StartsWithSegments("/swagger")
            || path.StartsWithSegments("/health")
            || path.StartsWithSegments("/api/internal")
            || path.StartsWithSegments("/media");
    }

    private async Task<ResolvedTenant> ResolveTenantAsync(HttpContext context, IApplicationDbContext db)
    {
        var cancellationToken = context.RequestAborted;
        var header = context.Request.Headers[HeaderName].ToString().Trim().ToLowerInvariant();
        // SignalR negotiate/WebSocket cannot always send custom headers; allow query fallback.
        var queryTenant = context.Request.Query["tenant"].ToString().Trim().ToLowerInvariant();

        string slug;
        if (!string.IsNullOrEmpty(header))
        {
            slug = header;
        }
        else if (!string.IsNullOrEmpty(queryTenant))
        {
            slug = queryTenant;
        }
        else
        {
            var host = context.Request.Host.Host;
            var byDomain = await FindByCustomDomainAsync(db, host, cancellationToken);
            if (byDomain is not null)
            {
                return byDomain;
            }

            // Bare hosts (localhost / apex) are not shops — only subdomains or custom domains.
            slug = GetSubdomain(host)
                ?? throw new NotFoundException("Tenant", string.IsNullOrWhiteSpace(host) ? "unknown" : host);
        }

        if (!SlugPattern().IsMatch(slug))
        {
            throw new NotFoundException("Tenant", slug);
        }

        var tenant = await db.Tenants.AsNoTracking()
            .Where(t => t.Slug == slug && t.IsActive)
            .Select(t => new ResolvedTenant(t.Id, t.Slug))
            .FirstOrDefaultAsync(cancellationToken);

        return tenant ?? throw new NotFoundException("Tenant", slug);
    }

    private static async Task<ResolvedTenant?> FindByCustomDomainAsync(
        IApplicationDbContext db,
        string host,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(host))
        {
            return null;
        }

        var domain = host.ToLowerInvariant();
        return await db.Tenants.AsNoTracking()
            .Where(t => t.CustomDomain == domain && t.IsActive)
            .Select(t => new ResolvedTenant(t.Id, t.Slug))
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <summary>shop2.localhost -> shop2; shop2.example.com -> shop2; localhost / example.com / IPs -> null.</summary>
    internal static string? GetSubdomain(string host)
    {
        if (string.IsNullOrWhiteSpace(host) || IPAddress.TryParse(host, out _))
        {
            return null;
        }

        var labels = host.ToLowerInvariant().Split('.', StringSplitOptions.RemoveEmptyEntries);
        var isLocalhost = labels.Length >= 2 && labels[^1] == "localhost";
        if (labels.Length < 3 && !isLocalhost)
        {
            return null;
        }

        var candidate = labels[0];
        return ReservedSubdomains.Contains(candidate) ? null : candidate;
    }

    [GeneratedRegex("^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$")]
    private static partial Regex SlugPattern();

    private sealed record ResolvedTenant(Guid Id, string Slug);
}
