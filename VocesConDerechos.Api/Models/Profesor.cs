namespace VocesConDerechos.Api.Models;

public class Profesor
{
    public int Id { get; set; }

    // Usuario de ASP.NET Identity
    public string UsuarioId { get; set; } = null!;

    public string Nombre { get; set; } = null!;
    public string Apellido { get; set; } = null!;

    // Relaciones
    public ICollection<Clase> Clases { get; set; } = new List<Clase>();

    public ICollection<Mision> MisionesCreadas { get; set; } = new List<Mision>();

}