namespace VocesConDerechos.Api.Models;

public class Escena
{
    public int Id { get; set; }

    public int HistoriaId { get; set; }

    public string Contenido { get; set; } = null!; // Texto narrativo

    public string? ImagenUrl { get; set; } // Opcional

    public int Orden { get; set; } // Orden dentro de la historia

    public bool EsFinal { get; set; } // Si es la última escena

    public bool TienePregunta { get; set; } // Si tiene pregunta al final

    public int? PreguntaId { get; set; } // Relación con pregunta

    // Relaciones
    public Historia Historia { get; set; } = null!;

    public ICollection<Decision> Decisiones { get; set; } = new List<Decision>();

    public Pregunta? Pregunta { get; set; }
}