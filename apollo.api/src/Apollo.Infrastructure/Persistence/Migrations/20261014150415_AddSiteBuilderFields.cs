using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apollo.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSiteBuilderFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminUrl",
                table: "UserPlatforms",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProvisioningError",
                table: "UserPlatforms",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProvisioningStatus",
                table: "UserPlatforms",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "StorefrontUrl",
                table: "UserPlatforms",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenantAdminEmail",
                table: "UserPlatforms",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "UserPlatforms",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenantSlug",
                table: "UserPlatforms",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "PlatformConfigurations",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ProductType",
                table: "Plans",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_UserPlatforms_TenantId",
                table: "UserPlatforms",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPlatforms_TenantSlug",
                table: "UserPlatforms",
                column: "TenantSlug",
                unique: true,
                filter: "[TenantSlug] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_PlatformConfigurations_Slug",
                table: "PlatformConfigurations",
                column: "Slug",
                unique: true,
                filter: "[Slug] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Plans_ProductType",
                table: "Plans",
                column: "ProductType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserPlatforms_TenantId",
                table: "UserPlatforms");

            migrationBuilder.DropIndex(
                name: "IX_UserPlatforms_TenantSlug",
                table: "UserPlatforms");

            migrationBuilder.DropIndex(
                name: "IX_PlatformConfigurations_Slug",
                table: "PlatformConfigurations");

            migrationBuilder.DropIndex(
                name: "IX_Plans_ProductType",
                table: "Plans");

            migrationBuilder.DropColumn(
                name: "AdminUrl",
                table: "UserPlatforms");

            migrationBuilder.DropColumn(
                name: "ProvisioningError",
                table: "UserPlatforms");

            migrationBuilder.DropColumn(
                name: "ProvisioningStatus",
                table: "UserPlatforms");

            migrationBuilder.DropColumn(
                name: "StorefrontUrl",
                table: "UserPlatforms");

            migrationBuilder.DropColumn(
                name: "TenantAdminEmail",
                table: "UserPlatforms");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "UserPlatforms");

            migrationBuilder.DropColumn(
                name: "TenantSlug",
                table: "UserPlatforms");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "PlatformConfigurations");

            migrationBuilder.DropColumn(
                name: "ProductType",
                table: "Plans");
        }
    }
}
