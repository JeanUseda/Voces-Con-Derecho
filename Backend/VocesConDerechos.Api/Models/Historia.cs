namespace VocesConDerechos.Api.Models;

public class Historia
{
    public int Id { get; set; }

    public string Titulo { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public int MisionId { get; set; }

    public int Orden { get; set; } // Para ordenar historias dentro de una misión

    public int PuntosBase { get; set; } = 10; // Puntos base por completar

    public bool Activa { get; set; } = true;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Relaciones
    public Mision Mision { get; set; } = null!;

    public ICollection<Escena> Escenas { get; set; } = new List<Escena>();
}