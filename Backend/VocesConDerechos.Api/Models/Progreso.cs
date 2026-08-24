namespace VocesConDerechos.Api.Models;

public class Progreso
{
    public int Id { get; set; }

    public int EstudianteId { get; set; }

    public int MisionId { get; set; }

    public string Estado { get; set; } = "pendiente"; // pendiente, en_progreso, completada

    public int Puntos { get; set; } // Solo puntos, sin XP

    public DateTime? FechaInicio { get; set; }

    public DateTime? FechaFinalizacion { get; set; }

    // Relaciones
    public Estudiante Estudiante { get; set; } = null!;

    public Mision Mision { get; set; } = null!;
}