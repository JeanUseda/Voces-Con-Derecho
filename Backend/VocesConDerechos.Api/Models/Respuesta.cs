namespace VocesConDerechos.Api.Models;

public class Respuesta
{
    public int Id { get; set; }

    public int PreguntaId { get; set; }

    public string Texto { get; set; } = null!;

    public bool EsCorrecta { get; set; }

    // Relaciones
    public Pregunta Pregunta { get; set; } = null!;
}