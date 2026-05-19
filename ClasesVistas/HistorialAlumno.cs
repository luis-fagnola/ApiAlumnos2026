using System;
using System.ComponentModel.DataAnnotations;

namespace NotasAlumnos2026.ClasesVistas;
public class HistorialAlumnos
{
      [Key]
 public int HistorialAlumnoID { get; set; }
 public int AlumnoID { get; set; }
public  string? CampoModificado { get; set; }
public string? ValorAnterior { get; set; }
public string? ValorNuevo { get; set; }
public DateTime FechaCambio { get; set; }


}