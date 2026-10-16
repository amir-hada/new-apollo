using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApolloShop.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddShopSmsToggles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "SmsOrderEnabled",
                table: "ShopSettings",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "SmsOtpEnabled",
                table: "ShopSettings",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SmsOrderEnabled",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "SmsOtpEnabled",
                table: "ShopSettings");
        }
    }
}
