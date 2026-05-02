using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAlumnos2026.Data;
using ApiAlumnos2026.Models;

namespace ApiAlumnos2026.Controllers;

// Controlador para gestionar las asignaturas del sistema.
// La ruta base es /api/Asignaturas
[Route("api/[controller]")]
[ApiController]
public class AsignaturasController : ControllerBase
{
    private readonly AppDbContext _context;

    // Recibe el contexto de base de datos.
    public AsignaturasController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/Asignaturas
    // Devuelve todas las asignaturas registradas.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Asignatura>>> GetAsignaturas()
    {
        return await _context.Asignaturas.ToListAsync();
    }

    // GET /api/Asignaturas/{id}
    // Busca una asignatura por ID. Devuelve not found.
    [HttpGet("{id}")]
    public async Task<ActionResult<Asignatura>> GetAsignatura(int id)
    {
        var asignatura = await _context.Asignaturas.FindAsync(id);

        if (asignatura == null)
        {
            return NotFound();
        }

        return asignatura;
    }

    // PUT /api/Asignaturas/{id}
    // Actualiza los datos de una asignatura existente.
    // Verifica que el ID coincida.
    [HttpPut("{id}")]
    public async Task<IActionResult> PutAsignatura(int id, Asignatura asignatura)
    {
        if (id != asignatura.AsignaturaID)
        {
            return BadRequest();
        }

        _context.Entry(asignatura).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // Si no existe al intentar guardar, devuelve not found.
            if (!AsignaturaExists(id))
            {
                return NotFound();
            }

            throw;
        }

        return NoContent();
    }

    // POST /api/Asignaturas
    // Crea una nueva asignatura y la guarda en la base.
    // Devuelve Creado con la ubicacion.
    [HttpPost]
    public async Task<ActionResult<Asignatura>> PostAsignatura(Asignatura asignatura)
    {
        _context.Asignaturas.Add(asignatura);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAsignatura), new { id = asignatura.AsignaturaID }, asignatura);
    }

    // DELETE /api/Asignaturas/{id}
    // Elimina una asignatura por su ID. Devuelve not found.
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAsignatura(int id)
    {
        var asignatura = await _context.Asignaturas.FindAsync(id);

        if (asignatura == null)
        {
            return NotFound();
        }

        _context.Asignaturas.Remove(asignatura);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // verifica si la asignatura existe.
    private bool AsignaturaExists(int id)
    {
        return _context.Asignaturas.Any(e => e.AsignaturaID == id);
    }
}
