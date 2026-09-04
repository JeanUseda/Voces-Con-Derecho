namespace VocesConDerechos.Api.Models;

public class Pregunta
{
    public int Id { get; set; }

    public string Enunciado { get; set; } = null!;

    public string? Explicacion { get; set; } // Explicación de la respuesta correcta

    public int Puntos { get; set; } = 5;

    // Relaciones
    public ICollection<Escena> Escenas { get; set; } = new List<Escena>();

    public ICollection<Respuesta> Respuestas { get; set; } = new List<Respuesta>();
}