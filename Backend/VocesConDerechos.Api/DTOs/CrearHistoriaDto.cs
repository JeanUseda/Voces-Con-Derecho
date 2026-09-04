namespace VocesConDerechos.Api.DTOs;

public class CrearHistoriaDto
{
    public string Titulo { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public int MisionId { get; set; }
    public int Orden { get; set; }
    public int PuntosBase { get; set; }
}

public class ActualizarHistoriaDto
{
    public string Titulo { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public int Orden { get; set; }
    public int PuntosBase { get; set; }
    public bool Activa { get; set; }
}