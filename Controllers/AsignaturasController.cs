using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAlumnos2026.Data;
using ApiAlumnos2026.Models;

namespace ApiAlumnos2026.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AsignaturasController : ControllerBase
{
    private readonly AppDbContext _context;

    public AsignaturasController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Asignatura>>> GetAsignaturas()
    {
        return await _context.Asignaturas.ToListAsync();
    }

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
            if (!AsignaturaExists(id))
            {
                return NotFound();
            }

            throw;
        }

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<Asignatura>> PostAsignatura(Asignatura asignatura)
    {
        _context.Asignaturas.Add(asignatura);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAsignatura), new { id = asignatura.AsignaturaID }, asignatura);
    }

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

    private bool AsignaturaExists(int id)
    {
        return _context.Asignaturas.Any(e => e.AsignaturaID == id);
    }
}
