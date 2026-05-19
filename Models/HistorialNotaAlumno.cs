

using System.ComponentModel.DataAnnotations;

namespace ApiAlumnos2026.Models;

public class HistorialNotaAlumno
{
    [Key]
    public int HistorialNotaAlumnoID { get; set; }

    [Required]
    public int NotaAlumnoID{ get; set; }

    [Required]
    public string? CampoModificado { get; set; }

    public string? ValorAnterior { get; set; }
    public string? ValorNuevo { get; set; }
    public DateTime FechaCambio { get; set; }
}