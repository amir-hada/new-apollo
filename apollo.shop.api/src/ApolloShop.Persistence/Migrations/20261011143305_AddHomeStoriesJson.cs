using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApolloShop.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHomeStoriesJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HomeStoriesJson",
                table: "ShopSettings",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HomeStoriesJson",
                table: "ShopSettings");
        }
    }
}
