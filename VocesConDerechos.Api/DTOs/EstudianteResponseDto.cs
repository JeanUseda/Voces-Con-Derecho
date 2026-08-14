// DTOs/EstudianteResponseDto.cs
namespace VocesConDerechos.Api.DTOs;

public class EstudianteResponseDto
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string Email { get; set; } = null!;

    public bool EsSecundaria { get; set; }

    public List<ClaseEstudianteDto> Clases { get; set; } = new();
}

public class ClaseEstudianteDto
{
    public int ClaseId { get; set; }

    public string ClaseNombre { get; set; } = null!;

    public int MisionesAsignadas { get; set; }
}