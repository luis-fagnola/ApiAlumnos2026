using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiAlumnos2026.Models;

public class NotaAlumno
{
    [Key]
    public int NotaAlumnoID { get; set; }

    [Required]
    public int AlumnoID { get; set; }

    [Required]
    public int AsignaturaID { get; set; }

    [Range(1, 10, ErrorMessage = "La nota debe estar entre 1 y 10")]
    public double Nota { get; set; }

    [ForeignKey(nameof(AlumnoID))]
    public Alumno? Alumno { get; set; }

    [ForeignKey(nameof(AsignaturaID))]
    public Asignatura? Asignatura { get; set; }
}
