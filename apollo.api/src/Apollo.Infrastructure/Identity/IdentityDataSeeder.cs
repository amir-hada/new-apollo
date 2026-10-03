using Apollo.Domain.Constants;
using Apollo.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Apollo.Infrastructure.Identity;

public static class IdentityDataSeeder
{
    public const string DefaultAdminUsername = "admin";
    public const string DefaultAdminPassword = "Admin@12345";
    public const string DefaultAdminEmail = "admin@apollo.local";

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("IdentityDataSeeder");

        foreach (var roleName in AppRoles.All)
        {
            if (await roleManager.RoleExistsAsync(roleName))
            {
                continue;
            }

            var createRole = await roleManager.CreateAsync(new IdentityRole<Guid>
            {
                Id = Guid.NewGuid(),
                Name = roleName,
                NormalizedName = roleName.ToUpperInvariant(),
            });

            if (!createRole.Succeeded)
            {
                logger.LogError(
                    "Failed to create role {Role}: {Errors}",
                    roleName,
                    string.Join(", ", createRole.Errors.Select(error => error.Description)));
            }
        }

        var admin = await userManager.FindByNameAsync(DefaultAdminUsername);
        if (admin is null)
        {
            admin = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = DefaultAdminUsername,
                Email = DefaultAdminEmail,
                EmailConfirmed = true,
                FirstName = "مدیر",
                LastName = "سیستم",
                CreatedAtUtc = DateTime.UtcNow,
            };

            var createAdmin = await userManager.CreateAsync(admin, DefaultAdminPassword);
            if (!createAdmin.Succeeded)
            {
                logger.LogError(
                    "Failed to create admin user: {Errors}",
                    string.Join(", ", createAdmin.Errors.Select(error => error.Description)));
                return;
            }

            logger.LogInformation(
                "Seeded admin user '{Username}' with password '{Password}'",
                DefaultAdminUsername,
                DefaultAdminPassword);
        }

        if (!await userManager.IsInRoleAsync(admin, AppRoles.Admin))
        {
            await userManager.AddToRoleAsync(admin, AppRoles.Admin);
        }

        if (!admin.IsActive)
        {
            admin.IsActive = true;
            await userManager.UpdateAsync(admin);
        }

        var users = userManager.Users.ToList();
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            if (roles.Count > 0)
            {
                continue;
            }

            await userManager.AddToRoleAsync(user, AppRoles.User);
        }
    }
}
