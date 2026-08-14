using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace VocesConDerechos.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddProgresoWithPuntos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UsuarioId",
                table: "Estudiantes",
                newName: "PasswordHash");

            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "Estudiantes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Estudiantes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "EsSecundaria",
                table: "Estudiantes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaRegistro",
                table: "Estudiantes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Pin",
                table: "Estudiantes",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Progresos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EstudianteId = table.Column<int>(type: "integer", nullable: false),
                    MisionId = table.Column<int>(type: "integer", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false, defaultValue: "pendiente"),
                    Puntos = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    FechaInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FechaFinalizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Progresos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Progresos_Estudiantes_EstudianteId",
                        column: x => x.EstudianteId,
                        principalTable: "Estudiantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Progresos_Misiones_MisionId",
                        column: x => x.MisionId,
                        principalTable: "Misiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Progresos_EstudianteId",
                table: "Progresos",
                column: "EstudianteId");

            migrationBuilder.CreateIndex(
                name: "IX_Progresos_MisionId",
                table: "Progresos",
                column: "MisionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Progresos");

            migrationBuilder.DropColumn(
                name: "Activo",
                table: "Estudiantes");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Estudiantes");

            migrationBuilder.DropColumn(
                name: "EsSecundaria",
                table: "Estudiantes");

            migrationBuilder.DropColumn(
                name: "FechaRegistro",
                table: "Estudiantes");

            migrationBuilder.DropColumn(
                name: "Pin",
                table: "Estudiantes");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "Estudiantes",
                newName: "UsuarioId");
        }
    }
}
