namespace VocesConDerechos.Api.DTOs;

public class RespuestaDto
{
    public int Id { get; set; }
    public string Texto { get; set; } = null!;
    public bool EsCorrecta { get; set; }
}