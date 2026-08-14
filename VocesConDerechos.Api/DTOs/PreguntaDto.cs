namespace VocesConDerechos.Api.DTOs;

public class PreguntaDto
{
    public int Id { get; set; }
    public string Enunciado { get; set; } = null!;
    public string? Explicacion { get; set; }
    public int Puntos { get; set; }
    public List<RespuestaDto> Respuestas { get; set; } = new();
}