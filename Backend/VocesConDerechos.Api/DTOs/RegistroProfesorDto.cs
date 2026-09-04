namespace VocesConDerechos.Api.DTOs;

public class RegistroProfesorDto
{
    public string Nombre { get; set; } = null!;
    public string? Apellido { get; set; }
    public string? Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? Rol { get; set; }  // ✅ NUEVO: admin, profesor
}