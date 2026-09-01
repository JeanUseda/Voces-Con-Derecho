using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocesConDerechos.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProfesorIdToEstudiante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProfesorId",
                table: "Estudiantes",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Estudiantes_ProfesorId",
                table: "Estudiantes",
                column: "ProfesorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Estudiantes_Profesores_ProfesorId",
                table: "Estudiantes",
                column: "ProfesorId",
                principalTable: "Profesores",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Estudiantes_Profesores_ProfesorId",
                table: "Estudiantes");

            migrationBuilder.DropIndex(
                name: "IX_Estudiantes_ProfesorId",
                table: "Estudiantes");

            migrationBuilder.DropColumn(
                name: "ProfesorId",
                table: "Estudiantes");
        }
    }
}
