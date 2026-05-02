  using System;
  public class VistaPromedioAlumno
    {
        public int AlumnoId { get; set; }
        public int AsignaturaID { get; set; }
        public required string Nombre { get; set; }
        public required string Apellido { get; set; }
        
        public int Dni { get; set; }
        public decimal Promedio { get; set; }
    }