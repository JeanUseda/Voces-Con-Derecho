using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Models;

namespace VocesConDerechos.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Profesor> Profesores => Set<Profesor>();

    public DbSet<Estudiante> Estudiantes => Set<Estudiante>();

    public DbSet<Clase> Clases => Set<Clase>();

    public DbSet<ClaseEstudiante> ClaseEstudiantes => Set<ClaseEstudiante>();

    public DbSet<Mision> Misiones => Set<Mision>();

    public DbSet<ClaseMision> ClaseMisiones => Set<ClaseMision>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==========================================
        // PROFESOR → CLASE
        // ==========================================

        modelBuilder.Entity<Clase>()
            .HasOne(c => c.Profesor)
            .WithMany(p => p.Clases)
            .HasForeignKey(c => c.ProfesorId)
            .OnDelete(DeleteBehavior.Restrict);


        // ==========================================
        // CLASE ↔ ESTUDIANTE
        // ==========================================

        modelBuilder.Entity<ClaseEstudiante>()
            .HasKey(ce => new
            {
                ce.ClaseId,
                ce.EstudianteId
            });

        modelBuilder.Entity<ClaseEstudiante>()
            .HasOne(ce => ce.Clase)
            .WithMany(c => c.Estudiantes)
            .HasForeignKey(ce => ce.ClaseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ClaseEstudiante>()
            .HasOne(ce => ce.Estudiante)
            .WithMany(e => e.Clases)
            .HasForeignKey(ce => ce.EstudianteId)
            .OnDelete(DeleteBehavior.Cascade);


        // ==========================================
        // PROFESOR → MISIÓN
        // ==========================================

        modelBuilder.Entity<Mision>()
            .HasOne(m => m.Profesor)
            .WithMany(p => p.MisionesCreadas)
            .HasForeignKey(m => m.ProfesorId)
            .OnDelete(DeleteBehavior.Restrict);


        // ==========================================
        // CLASE ↔ MISIÓN
        // ==========================================

        modelBuilder.Entity<ClaseMision>()
            .HasKey(cm => new
            {
                cm.ClaseId,
                cm.MisionId
            });

        modelBuilder.Entity<ClaseMision>()
            .HasOne(cm => cm.Clase)
            .WithMany(c => c.Misiones)
            .HasForeignKey(cm => cm.ClaseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ClaseMision>()
            .HasOne(cm => cm.Mision)
            .WithMany(m => m.Clases)
            .HasForeignKey(cm => cm.MisionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}