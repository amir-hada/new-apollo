using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApolloShop.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddShopHeroBannersJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HeroBannersJson",
                table: "ShopSettings",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HeroBannersJson",
                table: "ShopSettings");
        }
    }
}
