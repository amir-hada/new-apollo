using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using ApolloShop.Persistence.Interceptors;
using ApolloShop.Persistence.Tenancy;

namespace ApolloShop.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "ApolloShop.Api");
        if (!Directory.Exists(basePath))
        {
            basePath = Path.Combine(Directory.GetCurrentDirectory(), "src", "ApolloShop.Api");
        }

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(
            configuration.GetConnectionString("DefaultConnection")
            ?? "Server=localhost,1433;Database=ApolloShop;User Id=sa;Password=Your_password123;TrustServerCertificate=True;");

        var tenantContext = new TenantContext();
        tenantContext.Bypass();

        return new ApplicationDbContext(optionsBuilder.Options, new AuditableEntityInterceptor(), tenantContext);
    }
}
