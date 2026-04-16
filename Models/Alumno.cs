using System.ComponentModel.DataAnnotations;

namespace ApiAlumnos2026.Models;

public class Alumno
{
    [Key]
    public int AlumnoID { get; set; }

    [Required]
    public string Nombre { get; set; } = string.Empty;

    [Required]
    public string Apellido { get; set; } = string.Empty;

    [Required]
    public string DNI { get; set; } = string.Empty;

    [Required]
    public Sexo Sexo { get; set; }

    [Required]
    public string Domicilio { get; set; } = string.Empty;

    public ICollection<NotaAlumno> NotasAlumnos { get; set; } = new List<NotaAlumno>();
}
