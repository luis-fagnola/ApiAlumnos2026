using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAlumnos2026.ClasesVistas;
using ApiAlumnos2026.Data;
using ApiAlumnos2026.Models;

namespace ApiAlumnos2026.Controllers
{
    // Controlador para gestionar las notas de los alumnos.
    // La ruta base es /api/NotaAlumnoes
    [Route("api/[controller]")]
    [ApiController]
    public class NotaAlumnoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Recibe el contexto de base de datos.
        public NotaAlumnoesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/NotaAlumnoes/vista
        // Trae todos los alumnos y su nota (si tiene). Usa GroupJoin para
        // los que no tienen ninguna nota registrada.
        [HttpGet("vista")]
        public async Task<ActionResult<IEnumerable<VistaNotaAlumno>>> GetNotasVista()
        {
            var resultado = await _context.Alumnos
                .GroupJoin(
                    _context.NotasAlumnos,
                    a => a.AlumnoID,
                    n => n.AlumnoID,
                    (a, notas) => new { Alumno = a, Notas = notas }
                )
                .SelectMany(
                    x => x.Notas.DefaultIfEmpty(),
                    (x, nota) => new VistaNotaAlumno
                    {
                        NotaAlumnoID = nota != null ? nota.NotaAlumnoID : 0,
                        AlumnoID = x.Alumno.AlumnoID,
                        Nombre = x.Alumno.Nombre,
                        Apellido = x.Alumno.Apellido,
                        DNI = x.Alumno.DNI,
                        Nota = nota != null ? (double?)nota.Nota : null,
                        Fecha = nota != null ? (DateTime?)nota.Fecha : null
                    }
                )
                .ToListAsync();

            return Ok(resultado);
        }

        // GET: api/NotaAlumnoes
        // Devuelve todas las notas con los datos del alumno y la asignatura relacionados.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotaAlumno>>> GetNotas()
        {
            return await _context.NotasAlumnos
                .Include(n => n.Alumno)
                .Include(n => n.Asignatura)
                .ToListAsync();
        }

        // GET: api/NotaAlumnoes/5
        // Busca una nota especifica por ID incluyendo los datos del alumno y la asignatura.
        [HttpGet("{id}")]
        public async Task<ActionResult<NotaAlumno>> GetNotaAlumno(int id)
        {
            var notaAlumno = await _context.NotasAlumnos
                .Include(n => n.Alumno)
                .Include(n => n.Asignatura)
                .FirstOrDefaultAsync(n => n.NotaAlumnoID == id);

            if (notaAlumno == null)
            {
                return NotFound();
            }

            return notaAlumno;
        }

        // PUT: api/NotaAlumnoes/5
        // Edita una nota existente. Solo actualiza la nota, fecha y asignatura,
        // no permite cambiar el alumno al que pertenece.
        [HttpPut("{id}")]
public async Task<IActionResult> PutNotaAlumno(int id, NotaAlumno notaAlumno)
{
    if (id != notaAlumno.NotaAlumnoID)
    {
        return BadRequest();
    }

    var nota = await _context.NotasAlumnos.FindAsync(id);

    if (nota == null)
    {
        return NotFound();
    }

    //  NotaAlumno
    nota.Nota = notaAlumno.Nota;
    nota.Fecha = notaAlumno.Fecha;
    nota.AsignaturaID = notaAlumno.AsignaturaID;

    await _context.SaveChangesAsync();

    return NoContent();
}

        // POST: api/NotaAlumnoes
        // Crea una nueva nota para un alumno. La fecha se asigna automaticamente.
        [HttpPost]
        public async Task<ActionResult<NotaAlumno>> PostNotaAlumno(NotaAlumno notaAlumno)
        {
            // se guarda la fecha
             notaAlumno.Fecha = DateTime.Now; 
            _context.NotasAlumnos.Add(notaAlumno);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNotaAlumno", new { id = notaAlumno.NotaAlumnoID }, notaAlumno);
        }

        // POST: api/NotaAlumnoes/promedioalumnos
        // Calcula el promedio de notas de cada alumno filtrado por asignatura yfechas.
        // Recibe un objeto FiltroPromedio con fechaDesde, fechaHasta y asignaturaID.
        
        [HttpPost("promedioalumnos")]
        public async Task<ActionResult<IEnumerable<dynamic>>> GetPromedioAlumnos([FromBody] FiltroPromedio filtro)
        {
            try
            {
                if (string.IsNullOrEmpty(filtro.FechaDesde) || string.IsNullOrEmpty(filtro.FechaHasta))
                {
                    return BadRequest(new { mensaje = "Las fechas son requeridas" });
                }

                var fechaDesde = DateTime.Parse(filtro.FechaDesde);
                var fechaHasta = DateTime.Parse(filtro.FechaHasta).AddDays(1);

                var promedios = await _context.NotasAlumnos
                    .Include(n => n.Alumno)
                    .Include(n => n.Asignatura)
                    .Where(n => n.AsignaturaID == filtro.AsignaturaID &&
                               n.Fecha >= fechaDesde && n.Fecha < fechaHasta &&
                               n.Alumno != null)
                    .GroupBy(n => new { n.Alumno!.Nombre, n.Alumno.Apellido, n.Alumno.DNI })
                    .Select(g => new
                    {
                        nombre = g.Key.Nombre,
                        apellido = g.Key.Apellido,
                        dNI = g.Key.DNI,
                        promedio = g.Average(n => n.Nota)
                    })
                    .OrderBy(p => p.apellido)
                    .ThenBy(p => p.nombre)
                    .ToListAsync();

                return Ok(promedios);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = "Error al calcular promedios", error = ex.Message });
            }
        }

        // DELETE: api/NotaAlumnoes/5
        // Elimina una nota por su ID. Devuelve not foun.
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotaAlumno(int id)
        {
            var notaAlumno = await _context.NotasAlumnos.FindAsync(id);
            if (notaAlumno == null)
            {
                return NotFound();
            }

            _context.NotasAlumnos.Remove(notaAlumno);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // verifica si una nota existe en la base.
        private bool NotaAlumnoExists(int id)
        {
            return _context.NotasAlumnos.Any(e => e.NotaAlumnoID == id);
        }
    }
}
