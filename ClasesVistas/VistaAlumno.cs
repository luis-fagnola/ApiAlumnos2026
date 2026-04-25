using System;

namespace ApiAlumnos2026.ClasesVistas;

public class VistaAlumno
{
    public int AlumnoID { get; set; }
    public string? Nombre { get; set; }
    public string? Apellido { get; set; }
    public double Nota { get; set; }
    public string? DNI { get; set; }
    public string? SexoString { get; set; }
    public string? Domicilio { get; set; }
}
