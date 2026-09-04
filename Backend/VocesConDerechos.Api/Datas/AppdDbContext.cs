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

    public DbSet<Progreso> Progresos => Set<Progreso>();

    public DbSet<Historia> Historias => Set<Historia>();
    public DbSet<Escena> Escenas => Set<Escena>();
    public DbSet<Decision> Decisiones => Set<Decision>();
    public DbSet<Pregunta> Preguntas => Set<Pregunta>();
    public DbSet<Respuesta> Respuestas => Set<Respuesta>();
    public DbSet<ProgresoHistoria> ProgresoHistorias => Set<ProgresoHistoria>();
    public DbSet<InsigniaEstudiante> InsigniasEstudiante => Set<InsigniaEstudiante>();
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

        // ==========================================
        // ESTUDIANTE → PROGRESO
        // ==========================================

        modelBuilder.Entity<Progreso>()
            .HasOne(p => p.Estudiante)
            .WithMany(e => e.Progresos)
            .HasForeignKey(p => p.EstudianteId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Progreso>()
            .HasOne(p => p.Mision)
            .WithMany()
            .HasForeignKey(p => p.MisionId)
            .OnDelete(DeleteBehavior.Restrict);

        // ==========================================
        // VALORES POR DEFECTO
        // ==========================================

        modelBuilder.Entity<Progreso>()
            .Property(p => p.Estado)
            .HasDefaultValue("pendiente");

        modelBuilder.Entity<Progreso>()
            .Property(p => p.Puntos)
            .HasDefaultValue(0);

        // ==========================================
        // HISTORIA → ESCENA
        // ==========================================

        modelBuilder.Entity<Escena>()
            .HasOne(e => e.Historia)
            .WithMany(h => h.Escenas)
            .HasForeignKey(e => e.HistoriaId)
            .OnDelete(DeleteBehavior.Cascade);

        // ==========================================
        // ESCENA → DECISIÓN
        // ==========================================

        modelBuilder.Entity<Decision>()
            .HasOne(d => d.Escena)
            .WithMany(e => e.Decisiones)
            .HasForeignKey(d => d.EscenaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Decision>()
            .HasOne(d => d.SiguienteEscena)
            .WithMany()
            .HasForeignKey(d => d.SiguienteEscenaId)
            .OnDelete(DeleteBehavior.Restrict);

        // ==========================================
        // ESCENA → PREGUNTA
        // ==========================================

        modelBuilder.Entity<Escena>()
            .HasOne(e => e.Pregunta)
            .WithMany(p => p.Escenas)
            .HasForeignKey(e => e.PreguntaId)
            .OnDelete(DeleteBehavior.Restrict);

        // ==========================================
        // PREGUNTA → RESPUESTA
        // ==========================================

        modelBuilder.Entity<Respuesta>()
            .HasOne(r => r.Pregunta)
            .WithMany(p => p.Respuestas)
            .HasForeignKey(r => r.PreguntaId)
            .OnDelete(DeleteBehavior.Cascade);

        // ==========================================
        // PROGRESO HISTORIA
        // ==========================================

        modelBuilder.Entity<ProgresoHistoria>()
            .HasOne(ph => ph.Estudiante)
            .WithMany()
            .HasForeignKey(ph => ph.EstudianteId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ProgresoHistoria>()
            .HasOne(ph => ph.Historia)
            .WithMany()
            .HasForeignKey(ph => ph.HistoriaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ProgresoHistoria>()
            .HasOne(ph => ph.EscenaActual)
            .WithMany()
            .HasForeignKey(ph => ph.EscenaActualId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<InsigniaEstudiante>()
            .HasOne(ie => ie.Estudiante)
            .WithMany()
            .HasForeignKey(ie => ie.EstudianteId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<InsigniaEstudiante>()
            .HasOne(ie => ie.Mision)
            .WithMany()
            .HasForeignKey(ie => ie.MisionId)
            .OnDelete(DeleteBehavior.Restrict);

    }
}