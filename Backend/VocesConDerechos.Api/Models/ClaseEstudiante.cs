namespace VocesConDerechos.Api.Models;

public class ClaseEstudiante
{
    public int ClaseId { get; set; }

    public Clase Clase { get; set; } = null!;

    public int EstudianteId { get; set; }

    public Estudiante Estudiante { get; set; } = null!;

    public DateTime FechaIngreso { get; set; } = DateTime.UtcNow;

    public bool Activo { get; set; } = true;
}