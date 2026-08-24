using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace VocesConDerechos.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHistoriasInteractivas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Historias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titulo = table.Column<string>(type: "text", nullable: false),
                    Descripcion = table.Column<string>(type: "text", nullable: false),
                    MisionId = table.Column<int>(type: "integer", nullable: false),
                    Orden = table.Column<int>(type: "integer", nullable: false),
                    PuntosBase = table.Column<int>(type: "integer", nullable: false),
                    Activa = table.Column<bool>(type: "boolean", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Historias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Historias_Misiones_MisionId",
                        column: x => x.MisionId,
                        principalTable: "Misiones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Preguntas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Enunciado = table.Column<string>(type: "text", nullable: false),
                    Explicacion = table.Column<string>(type: "text", nullable: true),
                    Puntos = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Preguntas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Escenas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HistoriaId = table.Column<int>(type: "integer", nullable: false),
                    Contenido = table.Column<string>(type: "text", nullable: false),
                    ImagenUrl = table.Column<string>(type: "text", nullable: true),
                    Orden = table.Column<int>(type: "integer", nullable: false),
                    EsFinal = table.Column<bool>(type: "boolean", nullable: false),
                    TienePregunta = table.Column<bool>(type: "boolean", nullable: false),
                    PreguntaId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Escenas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Escenas_Historias_HistoriaId",
                        column: x => x.HistoriaId,
                        principalTable: "Historias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Escenas_Preguntas_PreguntaId",
                        column: x => x.PreguntaId,
                        principalTable: "Preguntas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Respuestas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PreguntaId = table.Column<int>(type: "integer", nullable: false),
                    Texto = table.Column<string>(type: "text", nullable: false),
                    EsCorrecta = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Respuestas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Respuestas_Preguntas_PreguntaId",
                        column: x => x.PreguntaId,
                        principalTable: "Preguntas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Decisiones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EscenaId = table.Column<int>(type: "integer", nullable: false),
                    Texto = table.Column<string>(type: "text", nullable: false),
                    SiguienteEscenaId = table.Column<int>(type: "integer", nullable: true),
                    Puntos = table.Column<int>(type: "integer", nullable: false),
                    EsCorrecta = table.Column<bool>(type: "boolean", nullable: false),
                    Retroalimentacion = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Decisiones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Decisiones_Escenas_EscenaId",
                        column: x => x.EscenaId,
                        principalTable: "Escenas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Decisiones_Escenas_SiguienteEscenaId",
                        column: x => x.SiguienteEscenaId,
                        principalTable: "Escenas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProgresoHistorias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EstudianteId = table.Column<int>(type: "integer", nullable: false),
                    HistoriaId = table.Column<int>(type: "integer", nullable: false),
                    EscenaActualId = table.Column<int>(type: "integer", nullable: false),
                    Completada = table.Column<bool>(type: "boolean", nullable: false),
                    PuntosObtenidos = table.Column<int>(type: "integer", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FechaCompletada = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgresoHistorias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgresoHistorias_Escenas_EscenaActualId",
                        column: x => x.EscenaActualId,
                        principalTable: "Escenas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProgresoHistorias_Estudiantes_EstudianteId",
                        column: x => x.EstudianteId,
                        principalTable: "Estudiantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProgresoHistorias_Historias_HistoriaId",
                        column: x => x.HistoriaId,
                        principalTable: "Historias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Decisiones_EscenaId",
                table: "Decisiones",
                column: "EscenaId");

            migrationBuilder.CreateIndex(
                name: "IX_Decisiones_SiguienteEscenaId",
                table: "Decisiones",
                column: "SiguienteEscenaId");

            migrationBuilder.CreateIndex(
                name: "IX_Escenas_HistoriaId",
                table: "Escenas",
                column: "HistoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Escenas_PreguntaId",
                table: "Escenas",
                column: "PreguntaId");

            migrationBuilder.CreateIndex(
                name: "IX_Historias_MisionId",
                table: "Historias",
                column: "MisionId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgresoHistorias_EscenaActualId",
                table: "ProgresoHistorias",
                column: "EscenaActualId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgresoHistorias_EstudianteId",
                table: "ProgresoHistorias",
                column: "EstudianteId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgresoHistorias_HistoriaId",
                table: "ProgresoHistorias",
                column: "HistoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Respuestas_PreguntaId",
                table: "Respuestas",
                column: "PreguntaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Decisiones");

            migrationBuilder.DropTable(
                name: "ProgresoHistorias");

            migrationBuilder.DropTable(
                name: "Respuestas");

            migrationBuilder.DropTable(
                name: "Escenas");

            migrationBuilder.DropTable(
                name: "Historias");

            migrationBuilder.DropTable(
                name: "Preguntas");
        }
    }
}
