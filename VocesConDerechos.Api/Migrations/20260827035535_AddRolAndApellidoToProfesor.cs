using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocesConDerechos.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRolAndApellidoToProfesor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Apellido",
                table: "Profesores",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Rol",
                table: "Profesores",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Apellido",
                table: "Profesores");

            migrationBuilder.DropColumn(
                name: "Rol",
                table: "Profesores");
        }
    }
}
