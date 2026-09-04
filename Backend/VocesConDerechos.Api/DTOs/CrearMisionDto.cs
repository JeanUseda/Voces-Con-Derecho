namespace VocesConDerechos.Api.DTOs;

public class CrearMisionDto
{
    public string Titulo { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public bool EsGlobal { get; set; }

    public int? ProfesorId { get; set; }
}