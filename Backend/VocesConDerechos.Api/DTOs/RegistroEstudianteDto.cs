// DTOs/RegistroEstudianteDto.cs
namespace VocesConDerechos.Api.DTOs;

public class RegistroEstudianteDto
{
    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public bool EsSecundaria { get; set; } = true;
}