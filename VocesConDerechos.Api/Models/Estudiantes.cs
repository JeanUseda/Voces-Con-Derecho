namespace VocesConDerechos.Api.Models;

public class Estudiante
{
    public int Id { get; set; }

    // Usuario de ASP.NET Identity
    public string UsuarioId { get; set; } = null!;

    public string Nombre { get; set; } = null!;
    public string Apellido { get; set; } = null!;

    // Relaciones
    public ICollection<ClaseEstudiante> Clases { get; set; } = new List<ClaseEstudiante>();
}