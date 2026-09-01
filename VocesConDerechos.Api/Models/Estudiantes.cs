namespace VocesConDerechos.Api.Models;

public class Estudiante
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string Apellido { get; set; } = null!;

    public string Email { get; set; } = null!; // Para secundaria

    public string PasswordHash { get; set; } = null!; // Para secundaria

    public string? Pin { get; set; } // Para primaria (opcional)

    public bool EsSecundaria { get; set; } // true = secundaria, false = primaria

    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

    public bool Activo { get; set; } = true;
    public int? ProfesorId { get; set; }
    public Profesor? Profesor { get; set; }
    // Relaciones
    public ICollection<ClaseEstudiante> Clases { get; set; } = new List<ClaseEstudiante>();

    public ICollection<Progreso> Progresos { get; set; } = new List<Progreso>();
}