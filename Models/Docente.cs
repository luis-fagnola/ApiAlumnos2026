using System.ComponentModel.DataAnnotations;

namespace ApiAlumnos2026.Models;

public class Docente
{
    [Key]
    public int DocenteID { get; set; }

    [Required]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    public string Apellido { get; set; } = string.Empty;

    [Required]
    public string DNI { get; set; } = string.Empty;

    [Required]
    public Sexo Sexo { get; set; }
}
