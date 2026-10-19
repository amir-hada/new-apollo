using System.Text;
using Apollo.Application.Abstractions.Identity;
using Apollo.Application.Abstractions.Notifications;
using Apollo.Application.Abstractions.Plans;
using Apollo.Application.Abstractions.Platforms;
using Apollo.Application.Abstractions.Shop;
using Apollo.Application.Abstractions.Sms;
using Apollo.Application.Abstractions.Storage;
using Apollo.Application.Abstractions.Support;
using Apollo.Infrastructure.Identity;
using Apollo.Infrastructure.Notifications;
using Apollo.Infrastructure.Options;
using Apollo.Infrastructure.Persistence;
using Apollo.Infrastructure.Plans;
using Apollo.Infrastructure.Platforms;
using Apollo.Infrastructure.Shop;
using Apollo.Infrastructure.Sms;
using Apollo.Infrastructure.Storage;
using Apollo.Infrastructure.Support;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Apollo.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<MinioOptions>(configuration.GetSection(MinioOptions.SectionName));
        services.Configure<ShopIntegrationOptions>(configuration.GetSection(ShopIntegrationOptions.SectionName));
        services.Configure<SmsIrOptions>(configuration.GetSection(SmsIrOptions.SectionName));

        services.AddHttpContextAccessor();
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services
            .AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
            {
                options.User.RequireUniqueEmail = false;

                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;

                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.AllowedForNewUsers = true;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException("Jwt configuration is missing.");

        var requireHttpsMetadata = configuration.GetValue("Jwt:RequireHttpsMetadata", true);

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = requireHttpsMetadata;
                options.SaveToken = false;
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        if (!string.IsNullOrWhiteSpace(accessToken))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    },
                };
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret)),
                    ClockSkew = TimeSpan.FromSeconds(30),
                };
            });

        services.AddAuthorization();
        services.AddSingleton<MinioObjectStorageService>();
        services.AddSingleton<ImageProcessor>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<IFileAccessService, FileAccessService>();
        services.AddScoped<IUserAccountService, UserAccountService>();
        services.AddScoped<IAdminUserService, AdminUserService>();
        services.AddScoped<IAdminPlanService, AdminPlanService>();
        services.AddScoped<IPlanCatalogService, PlanCatalogService>();
        services.AddScoped<IUserPlatformService, UserPlatformService>();
        services.AddHttpClient<IShopProvisioningClient, ShopProvisioningClient>((serviceProvider, client) =>
        {
            var shopOptions = serviceProvider.GetRequiredService<IOptions<ShopIntegrationOptions>>().Value;
            client.BaseAddress = new Uri(shopOptions.BaseUrl.TrimEnd('/') + "/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddScoped<ILoginHistoryService, LoginHistoryService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPlatformSmsSettingsService, PlatformSmsSettingsService>();
        services.AddScoped<ISupportTicketService, SupportTicketService>();
        services.AddHttpClient<ISmsSender, SmsIrSender>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        return services;
    }
}
