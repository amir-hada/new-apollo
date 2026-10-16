using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apollo.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformSmsSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PlatformSmsSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    ApiKey = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    LineNumber = table.Column<long>(type: "bigint", nullable: true),
                    OtpTemplateId = table.Column<int>(type: "int", nullable: false),
                    OtpParameterName = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    OrderTemplateId = table.Column<int>(type: "int", nullable: false),
                    OrderParameterName = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    OrderMessageTemplate = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformSmsSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlatformSmsSettings");
        }
    }
}
