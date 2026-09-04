namespace VocesConDerechos.Api.DTOs;

public class ProgresoHistoriaDto
{
    public int HistoriaId { get; set; }
    public string Titulo { get; set; } = null!;
    public bool Completada { get; set; }
    public int Puntos { get; set; }
    public DateTime? FechaCompletada { get; set; }
}