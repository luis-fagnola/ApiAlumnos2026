using System;

namespace NotasAlumnos2026.ClasesVistas;
public class ResultadoAlumnos
{
public decimal Promedio { get; set; }
    public int NotaMasAlta { get; set; }
    public string? AlumnoNotaMasAlta { get; set; }
    public int NotaMasBaja { get; set; }
    public string? AlumnoNotaMasBaja { get; set; }
    public int CantAprobados { get; set; }
    public int CantDesaprobados { get; set; }
    public string? EstadoDelGrupo { get; set; }


}
