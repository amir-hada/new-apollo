using System.Text;
using ApolloShop.Application.Abstractions;
using ApolloShop.Infrastructure.Auth;
using ApolloShop.Infrastructure.Identity;
using ApolloShop.Infrastructure.Options;
using ApolloShop.Infrastructure.Payments;
using ApolloShop.Infrastructure.Sms;
using ApolloShop.Infrastructure.Storage;
using ApolloShop.Infrastructure.Time;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace ApolloShop.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));
        services.Configure<FrontendOptions>(configuration.GetSection(FrontendOptions.SectionName));
        services.Configure<MinioOptions>(configuration.GetSection(MinioOptions.SectionName));
        services.Configure<ApolloPlatformOptions>(configuration.GetSection(ApolloPlatformOptions.SectionName));

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUserService>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPaymentGateway, MockPaymentGateway>();

        var apolloPlatform = configuration.GetSection(ApolloPlatformOptions.SectionName).Get<ApolloPlatformOptions>();
        if (apolloPlatform is not null
            && !string.IsNullOrWhiteSpace(apolloPlatform.BaseUrl)
            && !string.IsNullOrWhiteSpace(apolloPlatform.ProvisioningKey))
        {
            services.AddHttpClient<ISmsSender, PlatformGatewaySmsSender>((_, client) =>
            {
                client.BaseAddress = new Uri(apolloPlatform.BaseUrl.TrimEnd('/') + "/");
                client.Timeout = TimeSpan.FromSeconds(30);
            });
        }
        else
        {
            services.AddScoped<ISmsSender, LoggingSmsSender>();
        }

        var minio = configuration.GetSection(MinioOptions.SectionName).Get<MinioOptions>();
        if (minio is not null
            && !string.IsNullOrWhiteSpace(minio.AccessKey)
            && !string.IsNullOrWhiteSpace(minio.SecretKey)
            && !string.IsNullOrWhiteSpace(minio.Endpoint))
        {
            services.AddSingleton<IFileStorage, MinioFileStorage>();
        }
        else
        {
            services.AddScoped<IFileStorage, LocalFileStorage>();
        }

        var jwt = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException("Jwt configuration is missing.");

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrWhiteSpace(accessToken)
                            && path.StartsWithSegments("/hubs"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
                    ClockSkew = TimeSpan.FromMinutes(1)
                };
            });

        services.AddAuthorization();

        return services;
    }
}
