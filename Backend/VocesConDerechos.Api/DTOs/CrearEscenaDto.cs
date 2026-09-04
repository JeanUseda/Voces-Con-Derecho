namespace VocesConDerechos.Api.DTOs;

public class CrearEscenaDto
{
    public int HistoriaId { get; set; }
    public string Contenido { get; set; } = null!;
    public string? ImagenUrl { get; set; }
    public int Orden { get; set; }
    public bool EsFinal { get; set; }
    public bool TienePregunta { get; set; }
}

public class ActualizarEscenaDto
{
    public string Contenido { get; set; } = null!;
    public string? ImagenUrl { get; set; }
    public int Orden { get; set; }
    public bool EsFinal { get; set; }
    public bool TienePregunta { get; set; }
}