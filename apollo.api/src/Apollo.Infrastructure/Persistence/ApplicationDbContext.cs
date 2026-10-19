using Apollo.Domain.Constants;
using Apollo.Infrastructure.Identity;
using Apollo.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Apollo.Infrastructure.Persistence;

public sealed class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<PhoneOtp> PhoneOtps => Set<PhoneOtp>();

    public DbSet<StoredFile> StoredFiles => Set<StoredFile>();

    public DbSet<LoginHistory> LoginHistories => Set<LoginHistory>();

    public DbSet<UserNotification> UserNotifications => Set<UserNotification>();

    public DbSet<Plan> Plans => Set<Plan>();

    public DbSet<PlanProperty> PlanProperties => Set<PlanProperty>();

    public DbSet<PlanTemplate> PlanTemplates => Set<PlanTemplate>();

    public DbSet<UserPlatform> UserPlatforms => Set<UserPlatform>();

    public DbSet<PlatformConfiguration> PlatformConfigurations => Set<PlatformConfiguration>();

    public DbSet<PlatformSmsSettings> PlatformSmsSettings => Set<PlatformSmsSettings>();

    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();

    public DbSet<SupportTicketMessage> SupportTicketMessages => Set<SupportTicketMessage>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<PlatformSmsSettings>(entity =>
        {
            entity.ToTable("PlatformSmsSettings");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.ApiKey).HasMaxLength(512).IsRequired();
            entity.Property(item => item.OtpParameterName).HasMaxLength(64).IsRequired();
            entity.Property(item => item.OrderParameterName).HasMaxLength(64).IsRequired();
            entity.Property(item => item.OrderMessageTemplate).HasMaxLength(500).IsRequired();
        });

        builder.Entity<SupportTicket>(entity =>
        {
            entity.ToTable("SupportTickets");
            entity.HasKey(ticket => ticket.Id);
            entity.Property(ticket => ticket.Number).HasMaxLength(50).IsRequired();
            entity.Property(ticket => ticket.Subject).HasMaxLength(250).IsRequired();
            entity.Property(ticket => ticket.Message).HasMaxLength(5000).IsRequired();
            entity.Property(ticket => ticket.Status).HasConversion<int>();
            entity.Property(ticket => ticket.Priority).HasConversion<int>();
            entity.HasIndex(ticket => ticket.Number).IsUnique();
            entity.HasIndex(ticket => new { ticket.UserId, ticket.CreatedAtUtc });
            entity.HasIndex(ticket => new { ticket.Status, ticket.UpdatedAtUtc });
            entity.HasOne(ticket => ticket.User)
                .WithMany()
                .HasForeignKey(ticket => ticket.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(ticket => ticket.AssignedToAdmin)
                .WithMany()
                .HasForeignKey(ticket => ticket.AssignedToAdminId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasMany(ticket => ticket.Messages)
                .WithOne(message => message.Ticket)
                .HasForeignKey(message => message.TicketId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<SupportTicketMessage>(entity =>
        {
            entity.ToTable("SupportTicketMessages");
            entity.HasKey(message => message.Id);
            entity.Property(message => message.Body).HasMaxLength(5000).IsRequired();
            entity.HasIndex(message => new { message.TicketId, message.CreatedAtUtc });
            entity.HasOne(message => message.Sender)
                .WithMany()
                .HasForeignKey(message => message.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(user => user.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(user => user.LastName).HasMaxLength(100).IsRequired();
            entity.Property(user => user.NationalId).HasMaxLength(10);
            entity.Property(user => user.ProfilePictureUrl).HasMaxLength(2048);
            entity.Property(user => user.IsActive).HasDefaultValue(true);
            entity.HasIndex(user => user.NationalId).IsUnique().HasFilter("[NationalId] IS NOT NULL");
            entity.HasIndex(user => user.PhoneNumber).IsUnique().HasFilter("[PhoneNumber] IS NOT NULL");
        });

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(token => token.Id);
            entity.Property(token => token.Token).HasMaxLength(256).IsRequired();
            entity.HasIndex(token => token.Token).IsUnique();
            entity.HasOne(token => token.User)
                .WithMany(user => user.RefreshTokens)
                .HasForeignKey(token => token.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PhoneOtp>(entity =>
        {
            entity.HasKey(otp => otp.Id);
            entity.Property(otp => otp.MobileNumber).HasMaxLength(11).IsRequired();
            entity.Property(otp => otp.Code).HasMaxLength(5).IsRequired();
            entity.Property(otp => otp.Purpose).HasMaxLength(20).IsRequired();
            entity.HasIndex(otp => new { otp.MobileNumber, otp.Purpose, otp.CreatedAtUtc });
        });

        builder.Entity<StoredFile>(entity =>
        {
            entity.HasKey(file => file.Id);
            entity.Property(file => file.ObjectKey).HasMaxLength(512).IsRequired();
            entity.Property(file => file.OriginalFileName).HasMaxLength(255).IsRequired();
            entity.Property(file => file.ContentType).HasMaxLength(100).IsRequired();
            entity.Property(file => file.Purpose).HasMaxLength(50).IsRequired();
            entity.HasIndex(file => file.ObjectKey).IsUnique();
            entity.HasIndex(file => new { file.OwnerUserId, file.Purpose });
            entity.HasOne(file => file.Owner)
                .WithMany()
                .HasForeignKey(file => file.OwnerUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<LoginHistory>(entity =>
        {
            entity.HasKey(entry => entry.Id);
            entity.Property(entry => entry.IpAddress).HasMaxLength(45).IsRequired();
            entity.Property(entry => entry.UserAgent).HasMaxLength(512).IsRequired();
            entity.HasIndex(entry => new { entry.UserId, entry.LoggedInAtUtc });
            entity.HasOne(entry => entry.User)
                .WithMany()
                .HasForeignKey(entry => entry.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<UserNotification>(entity =>
        {
            entity.HasKey(notification => notification.Id);
            entity.Property(notification => notification.Type).HasMaxLength(50).IsRequired();
            entity.Property(notification => notification.Message).HasMaxLength(1000).IsRequired();
            entity.HasIndex(notification => new { notification.UserId, notification.IsRead });
            entity.HasIndex(notification => new { notification.UserId, notification.CreatedAtUtc });
            entity.HasOne(notification => notification.User)
                .WithMany()
                .HasForeignKey(notification => notification.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Plan>(entity =>
        {
            entity.HasKey(plan => plan.Id);
            entity.Property(plan => plan.Name).HasMaxLength(200).IsRequired();
            entity.Property(plan => plan.ImageFileId).HasMaxLength(36);
            entity.Property(plan => plan.Description).HasMaxLength(80).IsRequired();
            entity.Property(plan => plan.BillingPeriod).HasMaxLength(20).IsRequired();
            entity.Property(plan => plan.IsAvailable).HasDefaultValue(true);
            entity.Property(plan => plan.IsPublished).HasDefaultValue(false);
            entity.Property(plan => plan.ProductType)
                .HasConversion<int>()
                .HasDefaultValue(PlanProductType.Shop)
                .HasSentinel((PlanProductType)0);
            entity.HasIndex(plan => plan.ProductType);
            entity.HasIndex(plan => plan.Name);
            entity.HasIndex(plan => new { plan.IsAvailable, plan.BillingPeriod });
            entity.HasIndex(plan => plan.IsPublished);
        });

        builder.Entity<PlanProperty>(entity =>
        {
            entity.ToTable("PlanProperties");
            entity.HasKey(property => property.Id);
            entity.Property(property => property.Title).HasMaxLength(200).IsRequired();
            entity.Property(property => property.Value).HasMaxLength(500).IsRequired();
            entity.HasIndex(property => new { property.PlanId, property.SortOrder });
            entity.HasOne(property => property.Plan)
                .WithMany(plan => plan.Properties)
                .HasForeignKey(property => property.PlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PlanTemplate>(entity =>
        {
            entity.ToTable("PlanTemplates");
            entity.HasKey(template => template.Id);
            entity.Property(template => template.Title).HasMaxLength(200).IsRequired();
            entity.Property(template => template.Code).HasMaxLength(100).IsRequired();
            entity.Property(template => template.ImageFileId).HasMaxLength(36).IsRequired();
            entity.HasIndex(template => template.PlanId);
            entity.HasOne(template => template.Plan)
                .WithMany(plan => plan.Templates)
                .HasForeignKey(template => template.PlanId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<UserPlatform>(entity =>
        {
            entity.HasKey(platform => platform.Id);
            entity.Property(platform => platform.Name).HasMaxLength(200).IsRequired();
            entity.HasIndex(platform => platform.UserId);
            entity.HasIndex(platform => new { platform.UserId, platform.Name });
            entity.Property(platform => platform.TenantSlug).HasMaxLength(64);
            entity.Property(platform => platform.StorefrontUrl).HasMaxLength(500);
            entity.Property(platform => platform.AdminUrl).HasMaxLength(500);
            entity.Property(platform => platform.TenantAdminEmail).HasMaxLength(256);
            entity.Property(platform => platform.ProvisioningError).HasMaxLength(1000);
            entity.Property(platform => platform.ProvisioningStatus)
                .HasConversion<int>()
                .HasDefaultValue(SiteProvisioningStatus.Pending);
            entity.Property(platform => platform.IsActive)
                .HasDefaultValue(true);
            entity.HasIndex(platform => platform.TenantSlug)
                .IsUnique()
                .HasFilter("[TenantSlug] IS NOT NULL");
            entity.HasIndex(platform => platform.TenantId);
            entity.HasOne(platform => platform.Plan)
                .WithMany()
                .HasForeignKey(platform => platform.PlanId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(platform => platform.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<PlatformConfiguration>(entity =>
        {
            entity.ToTable("PlatformConfigurations");
            entity.HasKey(item => item.Id);
            entity.Property(item => item.WebsiteName).HasMaxLength(200).IsRequired();
            entity.Property(item => item.WebsiteLogoFileId).HasMaxLength(36).IsRequired();
            entity.Property(item => item.AdminUsername).HasMaxLength(100).IsRequired();
            entity.Property(item => item.AdminPassword).HasMaxLength(200).IsRequired();
            entity.Property(item => item.TemplateCode).HasMaxLength(100).IsRequired();
            entity.Property(item => item.Slug).HasMaxLength(64);
            entity.HasIndex(item => item.Slug)
                .IsUnique()
                .HasFilter("[Slug] IS NOT NULL");
            entity.HasIndex(item => item.PlatformId).IsUnique();
            entity.HasOne(item => item.Platform)
                .WithOne(platform => platform.Configuration)
                .HasForeignKey<PlatformConfiguration>(item => item.PlatformId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
