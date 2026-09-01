namespace VocesConDerechos.Api.Models;

public class Profesor
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!; 

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Rol { get; set; } = "profesor";

    public bool Activo { get; set; } = true;

    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    // Relaciones
    public ICollection<Clase> Clases { get; set; } = new List<Clase>();

    public ICollection<Mision> MisionesCreadas { get; set; } = new List<Mision>();
}