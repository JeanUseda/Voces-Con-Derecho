namespace VocesConDerechos.Api.DTOs;

public class CrearPreguntaDto
{
    public string Enunciado { get; set; } = null!;
    public string? Explicacion { get; set; }
    public int Puntos { get; set; }
}

public class AgregarRespuestaDto
{
    public string Texto { get; set; } = null!;
    public bool EsCorrecta { get; set; }
}