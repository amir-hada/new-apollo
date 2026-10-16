using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Apollo.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPlatformIsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "UserPlatforms",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "UserPlatforms");
        }
    }
}
