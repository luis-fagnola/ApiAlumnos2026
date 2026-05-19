using Microsoft.AspNetCore.Mvc;
using ApiAlumnos2026.ClasesVistas;
using ApiAlumnos2026.Data;
using Microsoft.EntityFrameworkCore;

namespace ApiAlumnos2026.Controllers;

[ApiController] 
[Route("api/[controller]")] 
public class PromedioAsignaturaController : ControllerBase
{
    private readonly AppDbContext _context; 

    public PromedioAsignaturaController(AppDbContext context)
    {
        _context = context; 
    }

    [HttpPost("promedioasignaturas")] 
    public async Task<ActionResult<IEnumerable<VistaPromedioAsignatura>>> PostPromedioAsignaturas([FromBody] FiltroPromedio filtro)
    {
        // Variables para almacenar los rangos de fechas si se proporcionan
        DateTime? fechaDesde = null;
        DateTime? fechaHasta = null;

        // Verifica si se proporcionó una fecha de inicio válida y la convierte
        if (!string.IsNullOrWhiteSpace(filtro.FechaDesde) &&
            DateTime.TryParse(filtro.FechaDesde, out DateTime fechaDesdeParseada))
        {
            fechaDesde = fechaDesdeParseada.Date; // Asigna la fecha sin la hora
        }

        // Verifica si se proporcionó una fecha de fin válida
        if (!string.IsNullOrWhiteSpace(filtro.FechaHasta) &&
            DateTime.TryParse(filtro.FechaHasta, out DateTime fechaHastaParseada))
        {
            fechaHasta = fechaHastaParseada.Date.AddDays(1).AddTicks(-1); // Ajusta la fecha al final del día
        }

        // consulta inicial para obtener las notas de los alumnos
        var consulta = _context.NotasAlumnos
            .AsNoTracking() 
            .Include(n => n.Asignatura) 
            .AsQueryable(); 

        // Filtra por ID de asignatura si se proporciona
        if (filtro.AsignaturaID > 0)
        {
            consulta = consulta.Where(n => n.AsignaturaID == filtro.AsignaturaID);
        }

        // Filtra por ID de alumno si se proporciona
        if (filtro.AlumnoID.HasValue && filtro.AlumnoID.Value > 0)
        {
            consulta = consulta.Where(n => n.AlumnoID == filtro.AlumnoID.Value);
        }

        // Filtra por fecha de inicio si se proporciona
        if (fechaDesde.HasValue)
        {
            consulta = consulta.Where(n => n.Fecha >= fechaDesde.Value);
        }

        // Filtra por fecha de fin si se proporciona
        if (fechaHasta.HasValue)
        {
            consulta = consulta.Where(n => n.Fecha <= fechaHasta.Value);
        }

        // Agrupa las notas por asignatura y calcula el promedio
        var resultado = await consulta
            .GroupBy(n => new
            {
                n.AsignaturaID, // Agrupa por ID de asignatura
                AsignaturaNombre = n.Asignatura != null ? n.Asignatura.Descripcion : "Sin Asignatura" // Usa el nombre de la asignatura o un valor por defecto
            })
            .Select(g => new VistaPromedioAsignatura
            {
                AsignaturaID = g.Key.AsignaturaID, 
                AsignaturaNombre = g.Key.AsignaturaNombre, 
                Promedio = decimal.Round((decimal)g.Average(n => n.Nota), 2) 
            })
            .OrderBy(v => v.AsignaturaNombre) 
            .ToListAsync(); 

        return Ok(resultado); 
    }
}