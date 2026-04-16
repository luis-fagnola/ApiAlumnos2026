using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAlumnos2026.Data;
using ApiAlumnos2026.Models;

namespace ApiAlumnos2026.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AlumnosController : ControllerBase
{
    private readonly AppDbContext _context;

    public AlumnosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Alumno>>> GetAlumnos()
    {
        return await _context.Alumnos.ToListAsync();
    }

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

    [HttpPut("{id}")]
    public async Task<IActionResult> PutAlumno(int id, Alumno alumno)
    {
        if (id != alumno.AlumnoID)
        {
            return BadRequest();
        }

        _context.Entry(alumno).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!AlumnoExists(id))
            {
                return NotFound();
            }

            throw;
        }

        return NoContent();
    }

    [HttpPost]
    public async Task<ActionResult<Alumno>> PostAlumno(Alumno alumno)
    {
        _context.Alumnos.Add(alumno);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAlumno), new { id = alumno.AlumnoID }, alumno);
    }

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

    private bool AlumnoExists(int id)
    {
        return _context.Alumnos.Any(e => e.AlumnoID == id);
    }
}
