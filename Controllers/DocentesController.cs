using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAlumnos2026.Data;
using ApiAlumnos2026.Models;

namespace ApiAlumnos2026.Controllers;

// Controlador para gestionar los docentes del sistema.
// La ruta base es /api/Docentes
[Route("api/[controller]")]
[ApiController]
public class DocentesController : ControllerBase
{
    private readonly AppDbContext _context;

    // Recibe el contexto de base de datos.
    public DocentesController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/Docentes
    // Devuelve la lista completa de todos los docentes.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Docente>>> GetDocentes()
    {
        return await _context.Docentes.ToListAsync();
    }

    // GET /api/Docentes/{id}
    // Busca un docente por su ID. Devuelve not found.
    [HttpGet("{id}")]
    public async Task<ActionResult<Docente>> GetDocente(int id)
    {
        var docente = await _context.Docentes.FindAsync(id);

        if (docente == null)
        {
            return NotFound();
        }

        return docente;
    }

    // PUT /api/Docentes/{id}
    // Edita los datos de un docente existente.
    // Verifica que el ID coincida.
    [HttpPut("{id}")]
    public async Task<IActionResult> PutDocente(int id, Docente docente)
    {
        if (id != docente.DocenteID)
        {
            return BadRequest();
        }

        _context.Entry(docente).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // Si el docente no existe, devuelve not found.
            if (!DocenteExists(id))
            {
                return NotFound();
            }

            throw;
        }

        return NoContent();
    }

    // POST /api/Docentes
    // Crea un nuevo docente y lo guarda.
    // Devuelve Creado con la ubicacion.
    [HttpPost]
    public async Task<ActionResult<Docente>> PostDocente(Docente docente)
    {
        _context.Docentes.Add(docente);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDocente), new { id = docente.DocenteID }, docente);
    }

    // DELETE /api/Docentes/{id}
    // Elimina un docente por su ID. Devuelve not found.
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocente(int id)
    {
        var docente = await _context.Docentes.FindAsync(id);

        if (docente == null)
        {
            return NotFound();
        }

        _context.Docentes.Remove(docente);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // verifica si un docente existe en la base.
    private bool DocenteExists(int id)
    {
        return _context.Docentes.Any(e => e.DocenteID == id);
    }
}
