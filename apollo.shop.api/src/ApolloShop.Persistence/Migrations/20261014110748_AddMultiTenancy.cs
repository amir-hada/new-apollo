using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ApolloShop.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiTenancy : Migration
    {
        // Existing rows are backfilled into the default tenant (apollo).
        private static readonly Guid DefaultTenantId = new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_PhoneNumber",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_Number",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Products_ProductCode",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_Sku",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_Slug",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_ProductAttributes_Name",
                table: "ProductAttributes");

            migrationBuilder.DropIndex(
                name: "IX_Orders_OrderNumber",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Coupons_Code",
                table: "Coupons");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Slug",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Brands_Slug",
                table: "Brands");

            migrationBuilder.DropIndex(
                name: "IX_BlogTags_Slug",
                table: "BlogTags");

            migrationBuilder.DropIndex(
                name: "IX_BlogPosts_Slug",
                table: "BlogPosts");

            migrationBuilder.DropIndex(
                name: "IX_BlogCategories_Slug",
                table: "BlogCategories");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Users",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Tickets",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "TicketCategories",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "ShopSettings",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "ProductVariants",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Products",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "ProductAttributes",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "PhoneOtps",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Coupons",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Categories",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Carts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Brands",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "BlogTags",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "BlogPosts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "BlogCategories",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Addresses",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: DefaultTenantId);

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CustomDomain = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Tenants",
                columns: new[] { "Id", "Slug", "Name", "CustomDomain", "IsActive", "CreatedAtUtc" },
                values: new object[] { DefaultTenantId, "apollo", "فروشگاه آپولو", null, true, new DateTime(2026, 10, 14, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Users",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Tickets",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "TicketCategories",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "ShopSettings",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "ProductVariants",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Products",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "ProductAttributes",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "PhoneOtps",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Orders",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Coupons",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Categories",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Carts",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Brands",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "BlogTags",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "BlogPosts",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "BlogCategories",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Addresses",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValue: DefaultTenantId);

            migrationBuilder.CreateIndex(
                name: "IX_Users_TenantId_Email",
                table: "Users",
                columns: new[] { "TenantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_TenantId_PhoneNumber",
                table: "Users",
                columns: new[] { "TenantId", "PhoneNumber" },
                unique: true,
                filter: "[PhoneNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_TenantId_Number",
                table: "Tickets",
                columns: new[] { "TenantId", "Number" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TicketCategories_TenantId",
                table: "TicketCategories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ShopSettings_TenantId",
                table: "ShopSettings",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductVariants_TenantId",
                table: "ProductVariants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_ProductCode",
                table: "Products",
                columns: new[] { "TenantId", "ProductCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_Sku",
                table: "Products",
                columns: new[] { "TenantId", "Sku" },
                unique: true,
                filter: "[Sku] IS NOT NULL AND [Sku] <> ''");

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_Slug",
                table: "Products",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributes_TenantId_Name",
                table: "ProductAttributes",
                columns: new[] { "TenantId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhoneOtps_TenantId",
                table: "PhoneOtps",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_TenantId_OrderNumber",
                table: "Orders",
                columns: new[] { "TenantId", "OrderNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_TenantId_Code",
                table: "Coupons",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId_Slug",
                table: "Categories",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Carts_TenantId",
                table: "Carts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Brands_TenantId_Slug",
                table: "Brands",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BlogTags_TenantId_Slug",
                table: "BlogTags",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_TenantId_Slug",
                table: "BlogPosts",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BlogCategories_TenantId_Slug",
                table: "BlogCategories",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_TenantId",
                table: "Addresses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_CustomDomain",
                table: "Tenants",
                column: "CustomDomain",
                unique: true,
                filter: "[CustomDomain] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Slug",
                table: "Tenants",
                column: "Slug",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Tenants_TenantId",
                table: "Addresses",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BlogCategories_Tenants_TenantId",
                table: "BlogCategories",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BlogPosts_Tenants_TenantId",
                table: "BlogPosts",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BlogTags_Tenants_TenantId",
                table: "BlogTags",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Brands_Tenants_TenantId",
                table: "Brands",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Carts_Tenants_TenantId",
                table: "Carts",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Tenants_TenantId",
                table: "Categories",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Coupons_Tenants_TenantId",
                table: "Coupons",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Tenants_TenantId",
                table: "Orders",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PhoneOtps_Tenants_TenantId",
                table: "PhoneOtps",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductAttributes_Tenants_TenantId",
                table: "ProductAttributes",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Tenants_TenantId",
                table: "Products",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariants_Tenants_TenantId",
                table: "ProductVariants",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ShopSettings_Tenants_TenantId",
                table: "ShopSettings",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketCategories_Tenants_TenantId",
                table: "TicketCategories",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Tenants_TenantId",
                table: "Tickets",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Tenants_TenantId",
                table: "Users",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Tenants_TenantId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_BlogCategories_Tenants_TenantId",
                table: "BlogCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_BlogPosts_Tenants_TenantId",
                table: "BlogPosts");

            migrationBuilder.DropForeignKey(
                name: "FK_BlogTags_Tenants_TenantId",
                table: "BlogTags");

            migrationBuilder.DropForeignKey(
                name: "FK_Brands_Tenants_TenantId",
                table: "Brands");

            migrationBuilder.DropForeignKey(
                name: "FK_Carts_Tenants_TenantId",
                table: "Carts");

            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Tenants_TenantId",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_Coupons_Tenants_TenantId",
                table: "Coupons");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Tenants_TenantId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_PhoneOtps_Tenants_TenantId",
                table: "PhoneOtps");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductAttributes_Tenants_TenantId",
                table: "ProductAttributes");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Tenants_TenantId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariants_Tenants_TenantId",
                table: "ProductVariants");

            migrationBuilder.DropForeignKey(
                name: "FK_ShopSettings_Tenants_TenantId",
                table: "ShopSettings");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketCategories_Tenants_TenantId",
                table: "TicketCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Tenants_TenantId",
                table: "Tickets");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Tenants_TenantId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropIndex(
                name: "IX_Users_TenantId_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_TenantId_PhoneNumber",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_TenantId_Number",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_TicketCategories_TenantId",
                table: "TicketCategories");

            migrationBuilder.DropIndex(
                name: "IX_ShopSettings_TenantId",
                table: "ShopSettings");

            migrationBuilder.DropIndex(
                name: "IX_ProductVariants_TenantId",
                table: "ProductVariants");

            migrationBuilder.DropIndex(
                name: "IX_Products_TenantId_ProductCode",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_TenantId_Sku",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_TenantId_Slug",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_ProductAttributes_TenantId_Name",
                table: "ProductAttributes");

            migrationBuilder.DropIndex(
                name: "IX_PhoneOtps_TenantId",
                table: "PhoneOtps");

            migrationBuilder.DropIndex(
                name: "IX_Orders_TenantId_OrderNumber",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Coupons_TenantId_Code",
                table: "Coupons");

            migrationBuilder.DropIndex(
                name: "IX_Categories_TenantId_Slug",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Carts_TenantId",
                table: "Carts");

            migrationBuilder.DropIndex(
                name: "IX_Brands_TenantId_Slug",
                table: "Brands");

            migrationBuilder.DropIndex(
                name: "IX_BlogTags_TenantId_Slug",
                table: "BlogTags");

            migrationBuilder.DropIndex(
                name: "IX_BlogPosts_TenantId_Slug",
                table: "BlogPosts");

            migrationBuilder.DropIndex(
                name: "IX_BlogCategories_TenantId_Slug",
                table: "BlogCategories");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_TenantId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "TicketCategories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "ShopSettings");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "ProductVariants");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "ProductAttributes");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "PhoneOtps");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Coupons");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Carts");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "BlogTags");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "BlogCategories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Addresses");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_PhoneNumber",
                table: "Users",
                column: "PhoneNumber",
                unique: true,
                filter: "[PhoneNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_Number",
                table: "Tickets",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_ProductCode",
                table: "Products",
                column: "ProductCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_Sku",
                table: "Products",
                column: "Sku",
                unique: true,
                filter: "[Sku] IS NOT NULL AND [Sku] <> ''");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Slug",
                table: "Products",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductAttributes_Name",
                table: "ProductAttributes",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_OrderNumber",
                table: "Orders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Coupons_Code",
                table: "Coupons",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Slug",
                table: "Categories",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Brands_Slug",
                table: "Brands",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BlogTags_Slug",
                table: "BlogTags",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BlogPosts_Slug",
                table: "BlogPosts",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BlogCategories_Slug",
                table: "BlogCategories",
                column: "Slug",
                unique: true);
        }
    }
}
