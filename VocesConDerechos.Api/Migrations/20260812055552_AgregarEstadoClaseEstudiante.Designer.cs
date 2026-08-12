using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using VocesConDerechos.Api.Data;

#nullable disable

namespace VocesConDerechos.Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260812055552_AgregarEstadoClaseEstudiante")]
    partial class AgregarEstadoClaseEstudiante
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.29")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("VocesConDerechos.Api.Models.Clase", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Nivel")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("ProfesorId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("ProfesorId");

                    b.ToTable("Clases");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.ClaseEstudiante", b =>
                {
                    b.Property<int>("ClaseId")
                        .HasColumnType("integer");

                    b.Property<int>("EstudianteId")
                        .HasColumnType("integer");

                    b.Property<bool>("Activo")
                        .HasColumnType("boolean");

                    b.Property<DateTime>("FechaIngreso")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("ClaseId", "EstudianteId");

                    b.HasIndex("EstudianteId");

                    b.ToTable("ClaseEstudiantes");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.ClaseMision", b =>
                {
                    b.Property<int>("ClaseId")
                        .HasColumnType("integer");

                    b.Property<int>("MisionId")
                        .HasColumnType("integer");

                    b.Property<bool>("Activa")
                        .HasColumnType("boolean");

                    b.Property<DateTime>("FechaAsignacion")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("ClaseId", "MisionId");

                    b.HasIndex("MisionId");

                    b.ToTable("ClaseMisiones");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.Estudiante", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Apellido")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("UsuarioId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Estudiantes");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.Mision", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Descripcion")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("EsGlobal")
                        .HasColumnType("boolean");

                    b.Property<int?>("ProfesorId")
                        .HasColumnType("integer");

                    b.Property<string>("Titulo")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("ProfesorId");

                    b.ToTable("Misiones");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.Profesor", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Apellido")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Nombre")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("UsuarioId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Profesores");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.Clase", b =>
                {
                    b.HasOne("VocesConDerechos.Api.Models.Profesor", "Profesor")
                        .WithMany("Clases")
                        .HasForeignKey("ProfesorId")
                        .OnDelete(DeleteBehavior.Restrict)
                        .IsRequired();

                    b.Navigation("Profesor");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.ClaseEstudiante", b =>
                {
                    b.HasOne("VocesConDerechos.Api.Models.Clase", "Clase")
                        .WithMany("Estudiantes")
                        .HasForeignKey("ClaseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("VocesConDerechos.Api.Models.Estudiante", "Estudiante")
                        .WithMany("Clases")
                        .HasForeignKey("EstudianteId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Clase");

                    b.Navigation("Estudiante");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.ClaseMision", b =>
                {
                    b.HasOne("VocesConDerechos.Api.Models.Clase", "Clase")
                        .WithMany("Misiones")
                        .HasForeignKey("ClaseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("VocesConDerechos.Api.Models.Mision", "Mision")
                        .WithMany("Clases")
                        .HasForeignKey("MisionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Clase");

                    b.Navigation("Mision");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.Mision", b =>
                {
                    b.HasOne("VocesConDerechos.Api.Models.Profesor", "Profesor")
                        .WithMany("MisionesCreadas")
                        .HasForeignKey("ProfesorId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.Navigation("Profesor");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.Clase", b =>
                {
                    b.Navigation("Estudiantes");

                    b.Navigation("Misiones");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.Estudiante", b =>
                {
                    b.Navigation("Clases");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.Mision", b =>
                {
                    b.Navigation("Clases");
                });

            modelBuilder.Entity("VocesConDerechos.Api.Models.Profesor", b =>
                {
                    b.Navigation("Clases");

                    b.Navigation("MisionesCreadas");
                });
#pragma warning restore 612, 618
        }
    }
}
