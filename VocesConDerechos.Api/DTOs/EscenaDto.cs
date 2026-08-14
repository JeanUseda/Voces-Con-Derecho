namespace VocesConDerechos.Api.DTOs;

public class EscenaDto
{
    public int Id { get; set; }
    public string Contenido { get; set; } = null!;
    public string? ImagenUrl { get; set; }
    public int Orden { get; set; }
    public bool EsFinal { get; set; }
    public bool TienePregunta { get; set; }
    public List<DecisionDto> Decisiones { get; set; } = new();
    public PreguntaDto? Pregunta { get; set; }
}