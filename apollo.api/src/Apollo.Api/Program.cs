using System.Threading.RateLimiting;
using Apollo.Api.Hubs;
using Apollo.Api.Middleware;
using Apollo.Api.Notifications;
using Apollo.Application;
using Apollo.Application.Abstractions.Notifications;
using Apollo.Infrastructure;
using Apollo.Infrastructure.Identity;
using Apollo.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddSignalR();
builder.Services.AddScoped<INotificationPushClient, SignalRNotificationPushClient>();

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(entry => entry.Value?.Errors.Count > 0)
                .ToDictionary(
                    entry => entry.Key,
                    entry => entry.Value!.Errors
                        .Select(error => TranslateModelError(error.ErrorMessage))
                        .ToArray());

            var firstError = errors.Values.SelectMany(messages => messages).FirstOrDefault()
                ?? "لطفاً اطلاعات وارد شده را بررسی کنید.";

            return new BadRequestObjectResult(new ValidationProblemDetails(errors)
            {
                Title = "خطای اعتبارسنجی",
                Detail = firstError,
                Status = StatusCodes.Status400BadRequest,
            });
        };
    });
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync();
}

await IdentityDataSeeder.SeedAsync(app.Services);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationsHub>("/hubs/notifications");

app.Run();

static string TranslateModelError(string message) =>
    message switch
    {
        "The MobileNumber field is required." => "شماره موبایل الزامی است.",
        "The Code field is required." => "کد تأیید الزامی است.",
        "The Purpose field is required." => "درخواست نامعتبر است. لطفاً صفحه را رفرش کنید.",
        _ when message.Contains("MobileNumber", StringComparison.Ordinal)
            => "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.",
        _ when message.Contains("Code", StringComparison.Ordinal)
            => "کد تأیید باید ۵ رقم باشد.",
        _ => "لطفاً اطلاعات وارد شده را بررسی کنید.",
    };
