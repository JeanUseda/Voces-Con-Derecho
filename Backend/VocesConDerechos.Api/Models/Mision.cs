namespace VocesConDerechos.Api.Models;

public class Mision
{
    public int Id { get; set; }

    public string Titulo { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    // true = misión global
    // false = misión personalizada por un profesor
    public bool EsGlobal { get; set; }

    // Solo se utiliza cuando la misión es personalizada
    public int? ProfesorId { get; set; }

    public Profesor? Profesor { get; set; }

    // Clases a las que está asignada
    public ICollection<ClaseMision> Clases { get; set; } =
        new List<ClaseMision>();

    public ICollection<Historia> Historias { get; set; } = new List<Historia>();
}