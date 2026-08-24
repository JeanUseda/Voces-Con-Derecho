using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace VocesConDerechos.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddInsigniasAndRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InsigniasEstudiante",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EstudianteId = table.Column<int>(type: "integer", nullable: false),
                    MisionId = table.Column<int>(type: "integer", nullable: false),
                    FechaDesbloqueo = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InsigniasEstudiante", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InsigniasEstudiante_Estudiantes_EstudianteId",
                        column: x => x.EstudianteId,
                        principalTable: "Estudiantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_InsigniasEstudiante_Misiones_MisionId",
                        column: x => x.MisionId,
                        principalTable: "Misiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InsigniasEstudiante_EstudianteId",
                table: "InsigniasEstudiante",
                column: "EstudianteId");

            migrationBuilder.CreateIndex(
                name: "IX_InsigniasEstudiante_MisionId",
                table: "InsigniasEstudiante",
                column: "MisionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InsigniasEstudiante");
        }
    }
}
