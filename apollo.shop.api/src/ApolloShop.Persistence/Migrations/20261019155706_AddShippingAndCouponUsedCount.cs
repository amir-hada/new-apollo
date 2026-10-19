using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApolloShop.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddShippingAndCouponUsedCount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "FlatShippingRate",
                table: "ShopSettings",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 50000m);

            migrationBuilder.AddColumn<decimal>(
                name: "FreeShippingThreshold",
                table: "ShopSettings",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShippingCustomerNote",
                table: "ShopSettings",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShippingEnabled",
                table: "ShopSettings",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "UsedCount",
                table: "Coupons",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.Sql(
                """
                UPDATE ShopSettings
                SET FreeShippingThreshold = 500000
                WHERE FreeShippingThreshold IS NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FlatShippingRate",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "FreeShippingThreshold",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "ShippingCustomerNote",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "ShippingEnabled",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "UsedCount",
                table: "Coupons");
        }
    }
}
