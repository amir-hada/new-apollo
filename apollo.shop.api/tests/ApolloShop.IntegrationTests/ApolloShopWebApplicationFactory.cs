using ApolloShop.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace ApolloShop.IntegrationTests;

public class ApolloShopWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _databaseName = $"ApolloShopTests-{Guid.NewGuid()}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        // DeferredHostBuilder applies these after the app's service registrations.
        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<ApplicationDbContext>));
            services.RemoveAll(typeof(ApplicationDbContext));
            services.RemoveAll(typeof(ApolloShop.Application.Abstractions.IApplicationDbContext));

            // EF Core 8+ may also register options configuration descriptors.
            var optionsConfigDescriptors = services
                .Where(d => d.ServiceType.IsGenericType
                    && d.ServiceType.GetGenericTypeDefinition().Name.Contains("DbContextOptions", StringComparison.Ordinal))
                .ToList();
            foreach (var descriptor in optionsConfigDescriptors)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseInMemoryDatabase(_databaseName));

            services.AddScoped<ApolloShop.Application.Abstractions.IApplicationDbContext>(
                sp => sp.GetRequiredService<ApplicationDbContext>());
        });
    }
}
