using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApolloShop.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSsoCodesAndExternalOwner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ExternalOwnerId",
                table: "Tenants",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ShopSsoCodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CodeHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    TenantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UsedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShopSsoCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShopSsoCodes_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_ExternalOwnerId",
                table: "Tenants",
                column: "ExternalOwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopSsoCodes_CodeHash",
                table: "ShopSsoCodes",
                column: "CodeHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShopSsoCodes_ExpiresAtUtc",
                table: "ShopSsoCodes",
                column: "ExpiresAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_ShopSsoCodes_TenantId",
                table: "ShopSsoCodes",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShopSsoCodes");

            migrationBuilder.DropIndex(
                name: "IX_Tenants_ExternalOwnerId",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ExternalOwnerId",
                table: "Tenants");
        }
    }
}
