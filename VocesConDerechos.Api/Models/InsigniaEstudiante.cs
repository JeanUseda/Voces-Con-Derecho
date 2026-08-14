namespace VocesConDerechos.Api.Models;

public class InsigniaEstudiante
{
    public int Id { get; set; }

    public int EstudianteId { get; set; }

    public int MisionId { get; set; }

    public DateTime FechaDesbloqueo { get; set; }

    // Relaciones
    public Estudiante Estudiante { get; set; } = null!;

    public Mision Mision { get; set; } = null!;
}