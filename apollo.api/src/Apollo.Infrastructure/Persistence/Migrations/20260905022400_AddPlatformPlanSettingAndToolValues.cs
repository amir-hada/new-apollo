using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apollo.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformPlanSettingAndToolValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PPSV",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlatformId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanSettingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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

            migrationBuilder.CreateTable(
                name: "PPTV",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlatformId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanToolId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PPTV", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PPTV_PlanTools_PlanToolId",
                        column: x => x.PlanToolId,
                        principalTable: "PlanTools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PPTV_UserPlatforms_PlatformId",
                        column: x => x.PlatformId,
                        principalTable: "UserPlatforms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PPSV_PlanSettingId",
                table: "PPSV",
                column: "PlanSettingId");

            migrationBuilder.CreateIndex(
                name: "IX_PPSV_PlatformId_PlanSettingId",
                table: "PPSV",
                columns: new[] { "PlatformId", "PlanSettingId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PPTV_PlanToolId",
                table: "PPTV",
                column: "PlanToolId");

            migrationBuilder.CreateIndex(
                name: "IX_PPTV_PlatformId_PlanToolId",
                table: "PPTV",
                columns: new[] { "PlatformId", "PlanToolId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PPSV");

            migrationBuilder.DropTable(
                name: "PPTV");
        }
    }
}
