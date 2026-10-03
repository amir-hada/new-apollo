using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apollo.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class DropPlanSettingsAndPpsvAddPlatformConfigurations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PPSV");

            migrationBuilder.DropTable(
                name: "PlanSettings");

            migrationBuilder.CreateTable(
                name: "PlatformConfigurations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlatformId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WebsiteName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    WebsiteLogoFileId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    AdminUsername = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AdminPassword = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TemplateCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformConfigurations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlatformConfigurations_UserPlatforms_PlatformId",
                        column: x => x.PlatformId,
                        principalTable: "UserPlatforms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlatformConfigurations_PlatformId",
                table: "PlatformConfigurations",
                column: "PlatformId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlatformConfigurations");

            migrationBuilder.CreateTable(
                name: "PlanSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanSettings_Plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "Plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PPSV",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanSettingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlatformId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PPSV", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PPSV_PlanSettings_PlanSettingId",
                        column: x => x.PlanSettingId,
                        principalTable: "PlanSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PPSV_UserPlatforms_PlatformId",
                        column: x => x.PlatformId,
                        principalTable: "UserPlatforms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlanSettings_PlanId_SortOrder",
                table: "PlanSettings",
                columns: new[] { "PlanId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_PPSV_PlanSettingId",
                table: "PPSV",
                column: "PlanSettingId");

            migrationBuilder.CreateIndex(
                name: "IX_PPSV_PlatformId_PlanSettingId",
                table: "PPSV",
                columns: new[] { "PlatformId", "PlanSettingId" },
                unique: true);
        }
    }
}
