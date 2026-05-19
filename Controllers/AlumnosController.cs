using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAlumnos2026.ClasesVistas;
using ApiAlumnos2026.Data;
using ApiAlumnos2026.Models;
using NotasAlumnos2026.ClasesVistas;

namespace ApiAlumnos2026.Controllers;

// Este controlador maneja todo lo relacionado a alumnos.
// La ruta base es /api/Alumnos
[Route("api/[controller]")]
[ApiController]
public class AlumnosController : ControllerBase
{
    private readonly AppDbContext _context;

    // Recibe el contexto de base de datos.
    public AlumnosController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/Alumnos/vista
    // Trae todos los alumnos con su primera nota cargada.
    // Devuelve una vista(VistaAlumno) en vez del modelo.
    [HttpGet("vista")]
    public async Task<ActionResult<IEnumerable<VistaAlumno>>> GetAlumnosVista()
    {
        return await _context.Alumnos
            .Include(a => a.NotasAlumnos)
            .Select(a => new VistaAlumno
            {
                AlumnoID = a.AlumnoID,
                Nombre = a.Nombre,
                Apellido = a.Apellido,
                DNI = a.DNI,
                SexoString = a.Sexo.ToString(),
                Domicilio = a.Domicilio,
                Nota = a.NotasAlumnos.Select(n => n.Nota).FirstOrDefault()
            })
            .ToListAsync();
    }

    // GET /api/Alumnos
    // Devuelve la lista completa de todos los alumnos sin filtro.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Alumno>>> GetAlumnos()
    {
        return await _context.Alumnos.ToListAsync();
    }

    // GET /api/Alumnos/{id}
    // Busca un alumno por su ID. Si no existe devuelve not found.
    [HttpGet("{id}")]
    public async Task<ActionResult<Alumno>> GetAlumno(int id)
    {
        var alumno = await _context.Alumnos.FindAsync(id);

        if (alumno == null)
        {
            return NotFound();
        }

        return alumno;
    }

    // GET /api/Alumnos/{id}/historial
    // Trae el historial de cambios de un alumno por su ID.
    [HttpGet("{id}/historial")]
    public async Task<ActionResult<IEnumerable<HistorialAlumnos>>> GetHistorialAlumno(int id)
    {
        // Busca el historial de cambios para un alumno por ID.
                var historial = await _context.HistorialAlumnos
                    .Where(h => h.AlumnoID == id)
                    .OrderByDescending(h => h.FechaCambio)
                    .ToListAsync();
    
                // Si no hay historial, responde not found.
                if (historial == null || !historial.Any())
                {
                    return NotFound();
                }
    
                return Ok(historial);
            }   

    // PUT /api/Alumnos/{id}
    
    [HttpPut("{id}")]
    public async Task<IActionResult> PutAlumno(int id, Alumno alumno)
    {
        if (id != alumno.AlumnoID)
        {
            return BadRequest();
        }
        
        var alumnoExistente = await _context.Alumnos.AsNoTracking().FirstOrDefaultAsync(a => a.AlumnoID == id);
        if (alumnoExistente == null)
        {
            return NotFound();
        }
        
        if (alumnoExistente.Nombre != alumno.Nombre)
        {
            _context.HistorialAlumnos.Add(new HistorialAlumnos
            {
                AlumnoID = id,
                CampoModificado = "Nombre",
                ValorAnterior = alumnoExistente.Nombre,
                ValorNuevo = alumno.Nombre,
                FechaCambio = DateTime.Now
            });
        }
        if (alumnoExistente.DNI != alumno.DNI)
        {
            _context.HistorialAlumnos.Add(new HistorialAlumnos
            {
                AlumnoID = id,
                CampoModificado = "DNI",
                ValorAnterior = alumnoExistente.DNI,
                ValorNuevo = alumno.DNI,
                FechaCambio = DateTime.Now
            });
        }
        if (alumnoExistente.Sexo != alumno.Sexo)
        {
            _context.HistorialAlumnos.Add(new HistorialAlumnos
            {
                AlumnoID = id,
                CampoModificado = "Sexo",
                ValorAnterior = alumnoExistente.Sexo.ToString(),
                ValorNuevo = alumno.Sexo.ToString(),
                FechaCambio = DateTime.Now
            });
        }
        if (alumnoExistente.Domicilio != alumno.Domicilio)
        {
            _context.HistorialAlumnos.Add(new HistorialAlumnos
            {
                AlumnoID = id,
                CampoModificado = "Domicilio",
                ValorAnterior = alumnoExistente.Domicilio,
                ValorNuevo = alumno.Domicilio,
                FechaCambio = DateTime.Now
            });
        }

       

        // Saca los espacios en blanco del DNI antes de guardar.
        alumno.DNI = alumno.DNI.Trim();
        
        // Si ya hay otro alumno con ese DNI (que no sea el mismo), rechaza con conflicto.
        if (await _context.Alumnos.AnyAsync(a => a.DNI.Trim() == alumno.DNI && a.AlumnoID != id))
        {
            return Conflict(new { mensaje = "El DNI ya existe" });
        }

        _context.Entry(alumno).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // Si el alumno no existe al intentar guardar, devuelve not found.
            if (!AlumnoExists(id))
            {
                return NotFound();
            }

            throw;
        }

        return NoContent();
    }

    // POST /api/Alumnos
    // Crea un nuevo alumno. Valida que no venga vacío, que tenga nombre
    // y que el DNI no esté ya registrado en la base de datos.
    [HttpPost]
    public async Task<ActionResult<Alumno>> PostAlumno(Alumno alumno)
    {
        if (alumno == null)
        {
            return BadRequest("alumno vacio");
        }

        if (string.IsNullOrWhiteSpace(alumno.Nombre))
        {
            return BadRequest("El nombre es obligatorio");
        }

        // Limpia espacios del DNI antes de verificar duplicados.
        alumno.DNI = alumno.DNI.Trim();

        // Si ya existe un alumno con ese DNI, no lo deja crear.
        if (await _context.Alumnos.AnyAsync(a => a.DNI == alumno.DNI))
        {
            return Conflict(new { mensaje = "El DNI ya existe" });
        }

        _context.Alumnos.Add(alumno);
        await _context.SaveChangesAsync();

        // Devuelve Creado con la ubicacion.
        return CreatedAtAction(nameof(GetAlumno), new { id = alumno.AlumnoID }, alumno);
    }

    // DELETE /api/Alumnos/{id}
    // Elimina un alumno por su ID. Si no existe devuelve not found.
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAlumno(int id)
    {
        var alumno = await _context.Alumnos.FindAsync(id);

        if (alumno == null)
        {
            return NotFound();
        }

        _context.Alumnos.Remove(alumno);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // verifica si un alumno existe en la base.
    private bool AlumnoExists(int id)
    {
        return _context.Alumnos.Any(e => e.AlumnoID == id);
    }
}