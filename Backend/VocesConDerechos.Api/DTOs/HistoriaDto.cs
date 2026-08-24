namespace VocesConDerechos.Api.DTOs;

public class HistoriaDto
{
    public int Id { get; set; }
    public string Titulo { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public int MisionId { get; set; }
    public int Orden { get; set; }
    public int PuntosBase { get; set; }
    public bool Activa { get; set; }
    public List<EscenaDto> Escenas { get; set; } = new();
}


