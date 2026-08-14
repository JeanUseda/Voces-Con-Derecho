using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VocesConDerechos.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordHashToProfesor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UsuarioId",
                table: "Profesores",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "Apellido",
                table: "Profesores",
                newName: "Email");

            migrationBuilder.AddColumn<bool>(
                name: "Activo",
                table: "Profesores",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaRegistro",
                table: "Profesores",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Activo",
                table: "Profesores");

            migrationBuilder.DropColumn(
                name: "FechaRegistro",
                table: "Profesores");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "Profesores",
                newName: "UsuarioId");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Profesores",
                newName: "Apellido");
        }
    }
}
