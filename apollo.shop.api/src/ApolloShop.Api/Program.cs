using System.Threading.RateLimiting;
using ApolloShop.Api.Hubs;
using ApolloShop.Api.Middleware;
using ApolloShop.Application;
using ApolloShop.Application.Abstractions;
using ApolloShop.Infrastructure;
using ApolloShop.Infrastructure.Options;
using ApolloShop.Persistence;
using ApolloShop.Persistence.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddSignalR();
builder.Services.AddScoped<IChatRealtimePublisher, SignalRChatRealtimePublisher>();

builder.Services.AddControllers();
builder.Services.AddProblemDetails();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "ApolloShop API", Version = "v1" });
    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme.ToLowerInvariant(),
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });
    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("bearer", document)] = []
    });
});

var frontendOrigin = builder.Configuration.GetSection(FrontendOptions.SectionName).Get<FrontendOptions>()?.Origin
    ?? "http://localhost:3000";

var allowedOrigins = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { frontendOrigin.TrimEnd('/') };
foreach (var origin in builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
{
    allowedOrigins.Add(origin.TrimEnd('/'));
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.SetIsOriginAllowed(origin => IsOriginAllowed(origin, allowedOrigins))
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("Docker"))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors("Frontend");
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<TenantClaimValidationMiddleware>();
app.UseAuthorization();
app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<ITenantContext>().Bypass();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DatabaseSeeder.SeedAsync(db);
}

app.Run();

static bool IsOriginAllowed(string origin, ISet<string> configuredOrigins)
{
    if (configuredOrigins.Contains(origin.TrimEnd('/')))
    {
        return true;
    }

    if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
    {
        return false;
    }

    // Local development: localhost and *.localhost on any port (e.g. shop2.localhost:3000).
    if (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
        || uri.Host.EndsWith(".localhost", StringComparison.OrdinalIgnoreCase)
        || uri.Host == "127.0.0.1")
    {
        return true;
    }

    // Temporary production tenancy: allow any subdomain of apolloapp.ir
    return uri.Host.Equals("apolloapp.ir", StringComparison.OrdinalIgnoreCase)
        || uri.Host.EndsWith(".apolloapp.ir", StringComparison.OrdinalIgnoreCase);
}

public partial class Program;
