namespace VocesConDerechos.Api.Models;

public class Decision
{
    public int Id { get; set; }

    public int EscenaId { get; set; }

    public string Texto { get; set; } = null!; // Texto de la opción

    public int? SiguienteEscenaId { get; set; } // A qué escena lleva

    public int Puntos { get; set; } // Puntos por elegir esta opción

    public bool EsCorrecta { get; set; } // Para preguntas con respuesta correcta

    public string? Retroalimentacion { get; set; } // Feedback al elegir

    // Relaciones
    public Escena Escena { get; set; } = null!;

    public Escena? SiguienteEscena { get; set; }
}