using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ApiAlumnos2026.Data;
using ApiAlumnos2026.Models;

namespace ApiAlumnos2026.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotaAlumnoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotaAlumnoesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/NotaAlumnoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NotaAlumno>>> GetNotas()
        {
            return await _context.NotasAlumnos
                .Include(n => n.Alumno)
                .Include(n => n.Asignatura)
                .ToListAsync();
        }

        // GET: api/NotaAlumnoes/5
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
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutNotaAlumno(int id, NotaAlumno notaAlumno)
        {
            if (id != notaAlumno.NotaAlumnoID)
            {
                return BadRequest();
            }

            _context.Entry(notaAlumno).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NotaAlumnoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/NotaAlumnoes
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<NotaAlumno>> PostNotaAlumno(NotaAlumno notaAlumno)
        {
            _context.NotasAlumnos.Add(notaAlumno);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetNotaAlumno", new { id = notaAlumno.NotaAlumnoID }, notaAlumno);
        }

        // DELETE: api/NotaAlumnoes/5
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

        private bool NotaAlumnoExists(int id)
        {
            return _context.NotasAlumnos.Any(e => e.NotaAlumnoID == id);
        }
    }
}
