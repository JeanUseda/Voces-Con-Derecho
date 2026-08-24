namespace VocesConDerechos.Api.DTOs;

public class ProgresoMisionDto
{
    public int MisionId { get; set; }
    public string Titulo { get; set; } = null!;
    public int TotalHistorias { get; set; }
    public int HistoriasCompletadas { get; set; }
    public int PuntosTotales { get; set; }
    public bool Completada { get; set; }
    public List<ProgresoHistoriaDto> Historias { get; set; } = new();
}