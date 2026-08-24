namespace VocesConDerechos.Api.Models;

public class ProgresoHistoria
{
    public int Id { get; set; }

    public int EstudianteId { get; set; }

    public int HistoriaId { get; set; }

    public int EscenaActualId { get; set; } // Última escena visitada

    public bool Completada { get; set; }

    public int PuntosObtenidos { get; set; }

    public DateTime? FechaInicio { get; set; }

    public DateTime? FechaCompletada { get; set; }

    // Relaciones
    public Estudiante Estudiante { get; set; } = null!;

    public Historia Historia { get; set; } = null!;

    public Escena EscenaActual { get; set; } = null!;
}