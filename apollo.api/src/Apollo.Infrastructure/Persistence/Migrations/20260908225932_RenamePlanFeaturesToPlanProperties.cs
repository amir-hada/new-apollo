using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apollo.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RenamePlanFeaturesToPlanProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlanFeatures_Plans_PlanId",
                table: "PlanFeatures");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PlanFeatures",
                table: "PlanFeatures");

            migrationBuilder.RenameTable(
                name: "PlanFeatures",
                newName: "PlanProperties");

            migrationBuilder.RenameIndex(
                name: "IX_PlanFeatures_PlanId_SortOrder",
                table: "PlanProperties",
                newName: "IX_PlanProperties_PlanId_SortOrder");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlanProperties",
                table: "PlanProperties",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PlanProperties_Plans_PlanId",
                table: "PlanProperties",
                column: "PlanId",
                principalTable: "Plans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlanProperties_Plans_PlanId",
                table: "PlanProperties");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PlanProperties",
                table: "PlanProperties");

            migrationBuilder.RenameTable(
                name: "PlanProperties",
                newName: "PlanFeatures");

            migrationBuilder.RenameIndex(
                name: "IX_PlanProperties_PlanId_SortOrder",
                table: "PlanFeatures",
                newName: "IX_PlanFeatures_PlanId_SortOrder");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PlanFeatures",
                table: "PlanFeatures",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PlanFeatures_Plans_PlanId",
                table: "PlanFeatures",
                column: "PlanId",
                principalTable: "Plans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
