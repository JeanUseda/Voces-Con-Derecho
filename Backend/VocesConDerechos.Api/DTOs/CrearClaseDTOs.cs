namespace VocesConDerechos.Api.DTOs;

public class CrearClaseDto
{
    public string Nombre { get; set; } = null!;

    public string Nivel { get; set; } = null!;

    public int ProfesorId { get; set; }
}