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
    
    [Route("api/[controller]")]
    [ApiController]
    public class NotaAlumnoesController : ControllerBase
    {
        // Contexto de base de datos 
        private readonly AppDbContext _context;

        // Constructor
        public NotaAlumnoesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/NotaAlumnoes/vista
        [HttpGet("vista")]
        public async Task<ActionResult<IEnumerable<VistaNotaAlumno>>> GetNotasVista()
        {
            // Trae todos los alumnos con sus notas.
            var alumnos = await _context.Alumnos
                .Include(a => a.NotasAlumnos)
                .ToListAsync();

            // Arma una vista  para la tabla del frontend.
            // Si el alumno no tiene notas se devuelve igual con Nota y Fecha en null.
            var resultado = alumnos.SelectMany(a =>
                a.NotasAlumnos.Any()
                    ? a.NotasAlumnos.Select(n => new VistaNotaAlumno
                    {
                        NotaAlumnoID = n.NotaAlumnoID,
                        AlumnoID = a.AlumnoID,
                        Nombre = a.Nombre,
                        Apellido = a.Apellido,
                        DNI = a.DNI,
                        Nota = n.Nota,
                        Fecha = n.Fecha
                    })
                    : new[] { new VistaNotaAlumno
                    {
                        NotaAlumnoID = 0,
                        AlumnoID = a.AlumnoID,
                        Nombre = a.Nombre,
                        Apellido = a.Apellido,
                        DNI = a.DNI,
                        Nota = null,
                        Fecha = null
                    }}
            ).ToList();

            // Devuelve el listado 
            return Ok(resultado);
        }

        // GET: api/NotaAlumnoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotaAlumno>>> GetNotas()
        {
            // Devuelve todas las notas con datos de alumno y asignatura.
            return await _context.NotasAlumnos
                .Include(n => n.Alumno)
                .Include(n => n.Asignatura)
                .ToListAsync();
        }

        // GET: api/NotaAlumnoes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<NotaAlumno>> GetNotaAlumno(int id)
        {
            // Busca una nota  por ID y sus relaciones.
            var notaAlumno = await _context.NotasAlumnos
                .Include(n => n.Alumno)
                .Include(n => n.Asignatura)
                .FirstOrDefaultAsync(n => n.NotaAlumnoID == id);

            // Si no existe, responde not found.
            if (notaAlumno == null)
            {
                return NotFound();
            }

            
            return notaAlumno;
        }


// get historial de cambios
        [HttpGet("{id}/historial")]
        public async Task<ActionResult<IEnumerable<HistorialNotaAlumno>>> GetHistorialNotaAlumno(int
    id)
            {
                // Busca el historial de cambios para una nota por ID.
                var historial = await _context.HistorialNotaAlumnos
                    .Where(h => h.NotaAlumnoID == id)
                    .OrderByDescending(h => h.FechaCambio)
                    .ToListAsync();
    
                // Si no hay historial, responde not found.
                if (historial == null || !historial.Any())
                {
                    return NotFound();
                }
    
                return Ok(historial);
            }   
        // PUT: api/NotaAlumnoes/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutNotaAlumno(int id, NotaAlumno notaAlumno)
        {
            // Valida que el ID  coincida con el ID del objeto recibido.
            if (id != notaAlumno.NotaAlumnoID)
            {
                return BadRequest();
            }

            // Busca la nota actual en la base.
            var nota = await _context.NotasAlumnos.FindAsync(id);

            // Si no existe, devuelve not found
            if (nota == null)
            {
                return NotFound();
            }

            var ahora = DateTime.Now;

            // Registra historial solo para los campos que realmente cambiaron.
            if (nota.Nota != notaAlumno.Nota)
            {
                _context.HistorialNotaAlumnos.Add(new HistorialNotaAlumno
                {
                    NotaAlumnoID = id,
                    FechaCambio = ahora,
                    CampoModificado = "Nota",
                    ValorAnterior = nota.Nota.ToString(),
                    ValorNuevo = notaAlumno.Nota.ToString()
                });
            }

            if (nota.Fecha.Date != notaAlumno.Fecha.Date)
            {
                _context.HistorialNotaAlumnos.Add(new HistorialNotaAlumno
                {
                    
                    FechaCambio = ahora,
                    CampoModificado = "Fecha",
                    ValorAnterior = nota.Fecha.ToString("dd/MM/yyyy"),
                    ValorNuevo = notaAlumno.Fecha.ToString("dd/MM/yyyy")
                });
            }

            if (nota.AsignaturaID != notaAlumno.AsignaturaID)
            {
                _context.HistorialNotaAlumnos.Add(new HistorialNotaAlumno
                {
                    
                    FechaCambio = ahora,
                    CampoModificado = "Asignatura",
                    ValorAnterior = nota.AsignaturaID.ToString(),
                    ValorNuevo = notaAlumno.AsignaturaID.ToString()
                });
            }

            // Actualiza solo los campos editables de la nota.
            nota.Nota = notaAlumno.Nota;
            nota.Fecha = notaAlumno.Fecha;
            nota.AsignaturaID = notaAlumno.AsignaturaID;

            // Guarda los cambios.
            await _context.SaveChangesAsync();

            // Respuesta para sin contenido
            return NoContent();
        }

        // POST: api/NotaAlumnoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<NotaAlumno>> PostNotaAlumno(NotaAlumno notaAlumno)
        {
            // Asigna la fecha actual al crear la nota.
            notaAlumno.Fecha = DateTime.Now;

            // Guarda la nueva nota en base de datos.
            _context.NotasAlumnos.Add(notaAlumno);
            await _context.SaveChangesAsync();

            // Devuelve la ruta para consultar 
            return CreatedAtAction("GetNotaAlumno", new { id = notaAlumno.NotaAlumnoID }, notaAlumno);
        }

        // POST: api/NotaAlumnoes/promedioalumnos
        [HttpPost("promedioalumnos")]
        public async Task<ActionResult<IEnumerable<dynamic>>> GetPromedioAlumnos([FromBody] FiltroPromedio filtro)
        {
            try
            {
                // Valida que se envien ambas fechas para filtrar.
                if (string.IsNullOrEmpty(filtro.FechaDesde) || string.IsNullOrEmpty(filtro.FechaHasta))
                {
                    return BadRequest(new { mensaje = "Las fechas son requeridas" });
                }

                // Convierte fechas y ajusta fechaHasta para incluir todo el dia.
                var fechaDesde = DateTime.Parse(filtro.FechaDesde);
                var fechaHasta = DateTime.Parse(filtro.FechaHasta).AddDays(1);

                // Filtra por asignatura y rango de fechas, agrupa por alumno y calcula promedio.
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

                // Devuelve el listado de promedios ordenado.
                return Ok(promedios);
            }
            catch (Exception ex)
            {
                // Si hay error devuelve el mensaje.
                return BadRequest(new { mensaje = "Error al calcular promedios", error = ex.Message });
            }
        }

        


        // DELETE: api/NotaAlumnoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotaAlumno(int id)
        {
            // Busca la nota a eliminar por ID.
            var notaAlumno = await _context.NotasAlumnos.FindAsync(id);

            // Si no existe, respondenot found.
            if (notaAlumno == null)
            {
                return NotFound();
            }

            // Elimina el registro y guarda cambios.
            _context.NotasAlumnos.Remove(notaAlumno);
            await _context.SaveChangesAsync();

            // Respuesta borrado exitoso .
            return NoContent();
        }

        // Verifica si una nota existe por ID.
        private bool NotaAlumnoExists(int id)
        {
            return _context.NotasAlumnos.Any(e => e.NotaAlumnoID == id);
        }
    }
}


