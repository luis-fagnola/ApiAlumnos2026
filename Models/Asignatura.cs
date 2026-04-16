using System.ComponentModel.DataAnnotations;

namespace ApiAlumnos2026.Models;

public class Asignatura
{
    [Key]
    public int AsignaturaID { get; set; }

    [Required]
    public string Descripcion { get; set; } = string.Empty;

    public bool Eliminado { get; set; }

    public ICollection<NotaAlumno> NotasAlumnos { get; set; } = new List<NotaAlumno>();
}
