using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAlumnos2026.Data;
using ApiAlumnos2026.Models;

namespace ApiAlumnos2026.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DocentesController : ControllerBase
{
    private readonly AppDbContext _context;

    public DocentesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Docente>>> GetDocentes()
    {
        return await _context.Docentes.ToListAsync();
    }

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
            if (!DocenteExists(id))
            {
                return NotFound();
            }

            throw;
        }

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<Docente>> PostDocente(Docente docente)
    {
        _context.Docentes.Add(docente);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDocente), new { id = docente.DocenteID }, docente);
    }

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

    private bool DocenteExists(int id)
    {
        return _context.Docentes.Any(e => e.DocenteID == id);
    }
}
