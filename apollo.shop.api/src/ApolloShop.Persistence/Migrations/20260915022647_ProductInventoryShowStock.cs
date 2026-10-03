using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApolloShop.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ProductInventoryShowStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LowStockThreshold",
                table: "Products",
                newName: "StockDisplayThreshold");

            migrationBuilder.AddColumn<bool>(
                name: "ShowStockInStore",
                table: "Products",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowStockInStore",
                table: "Products");

            migrationBuilder.RenameColumn(
                name: "StockDisplayThreshold",
                table: "Products",
                newName: "LowStockThreshold");
        }
    }
}
