namespace VocesConDerechos.Api.DTOs;

public class GuardarProgresoDto
{
    public int EstudianteId { get; set; }
    public int HistoriaId { get; set; }
    public int EscenaActualId { get; set; }
    public bool Completada { get; set; }
    public int PuntosObtenidos { get; set; }
}