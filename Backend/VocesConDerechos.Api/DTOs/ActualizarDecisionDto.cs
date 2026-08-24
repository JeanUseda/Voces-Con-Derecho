namespace VocesConDerechos.Api.DTOs;

public class ActualizarDecisionDto
{
    public string Texto { get; set; } = null!;
    public int? SiguienteEscenaId { get; set; }
    public int Puntos { get; set; }
    public bool EsCorrecta { get; set; }
    public string? Retroalimentacion { get; set; }
}