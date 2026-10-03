using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApolloShop.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ProductPricingBaseAndDiscount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Old model: BasePrice = selling, CompareAtPrice = higher original, CostPrice = cost
            // New model: BasePrice = اصلی, DiscountPrice = قیمت با تخفیف (optional)
            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPrice",
                table: "Products",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE Products
                SET
                    DiscountPrice = CASE
                        WHEN CompareAtPrice IS NOT NULL AND CompareAtPrice > BasePrice THEN BasePrice
                        ELSE NULL
                    END,
                    BasePrice = CASE
                        WHEN CompareAtPrice IS NOT NULL AND CompareAtPrice > BasePrice THEN CompareAtPrice
                        ELSE BasePrice
                    END;
                """);

            // Variant already stores Price=selling and CompareAtPrice=original; keep as-is.

            migrationBuilder.DropColumn(
                name: "CompareAtPrice",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "CostPrice",
                table: "Products");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CompareAtPrice",
                table: "Products",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CostPrice",
                table: "Products",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE Products
                SET
                    CompareAtPrice = CASE
                        WHEN DiscountPrice IS NOT NULL AND DiscountPrice < BasePrice THEN BasePrice
                        ELSE NULL
                    END,
                    BasePrice = CASE
                        WHEN DiscountPrice IS NOT NULL AND DiscountPrice < BasePrice THEN DiscountPrice
                        ELSE BasePrice
                    END;
                """);

            migrationBuilder.DropColumn(
                name: "DiscountPrice",
                table: "Products");
        }
    }
}
