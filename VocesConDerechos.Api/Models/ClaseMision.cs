namespace VocesConDerechos.Api.Models;

public class ClaseMision
{
    public int ClaseId { get; set; }

    public Clase Clase { get; set; } = null!;

    public int MisionId { get; set; }

    public Mision Mision { get; set; } = null!;

    public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;

    public bool Activa { get; set; } = true;
}