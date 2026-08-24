namespace VocesConDerechos.Api.Models;

public class Clase
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string Nivel { get; set; } = null!;

    // Profesor responsable
    public int ProfesorId { get; set; }

    public Profesor Profesor { get; set; } = null!;

    // Estudiantes pertenecientes a la clase
    public ICollection<ClaseEstudiante> Estudiantes { get; set; } =
        new List<ClaseEstudiante>();

    // Misiones asignadas
    public ICollection<ClaseMision> Misiones { get; set; } =
        new List<ClaseMision>();
}