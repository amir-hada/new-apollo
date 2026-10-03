using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApolloShop.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ProductSpecMultiValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsOrderParameter",
                table: "ProductSpecifications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SelectedOptionsJson",
                table: "OrderItems",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SelectedOptionsJson",
                table: "CartItems",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProductSpecificationValues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SpecificationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PriceAdjustment = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductSpecificationValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductSpecificationValues_ProductSpecifications_SpecificationId",
                        column: x => x.SpecificationId,
                        principalTable: "ProductSpecifications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductSpecificationValues_SpecificationId",
                table: "ProductSpecificationValues",
                column: "SpecificationId");

            migrationBuilder.Sql("""
                INSERT INTO ProductSpecificationValues (Id, SpecificationId, Value, PriceAdjustment, SortOrder)
                SELECT NEWID(), Id, Value, 0, 1
                FROM ProductSpecifications
                WHERE Value IS NOT NULL AND LTRIM(RTRIM(Value)) <> '';
                """);

            migrationBuilder.DropColumn(
                name: "Value",
                table: "ProductSpecifications");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Value",
                table: "ProductSpecifications",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("""
                UPDATE s
                SET s.Value = COALESCE((
                    SELECT TOP 1 v.Value
                    FROM ProductSpecificationValues v
                    WHERE v.SpecificationId = s.Id
                    ORDER BY v.SortOrder
                ), '')
                FROM ProductSpecifications s;
                """);

            migrationBuilder.DropTable(
                name: "ProductSpecificationValues");

            migrationBuilder.DropColumn(
                name: "IsOrderParameter",
                table: "ProductSpecifications");

            migrationBuilder.DropColumn(
                name: "SelectedOptionsJson",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "SelectedOptionsJson",
                table: "CartItems");
        }
    }
}
