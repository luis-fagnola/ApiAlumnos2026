using System;

namespace ApiAlumnos2026.ClasesVistas;

public class VistaNotaAlumno
{
    public int NotaAlumnoID { get; set; }
    public int AlumnoID { get; set; }
    public string? Nombre { get; set; }
    public string? Apellido { get; set; }
    public double? Nota { get; set; }
    public string? DNI { get; set; }
    public DateTime? Fecha { get; set; }
}
