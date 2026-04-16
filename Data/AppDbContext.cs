    
using System;
using Microsoft.EntityFrameworkCore;
using ApiAlumnos2026.Models;

namespace ApiAlumnos2026.Data;

public class AppDbContext: DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Alumno> Alumnos { get; set; }
    public DbSet<Docente> Docentes { get; set; }
    public DbSet<Asignatura> Asignaturas { get; set; }
    public DbSet<NotaAlumno> NotasAlumnos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<NotaAlumno>()
            .HasOne(n => n.Alumno)
            .WithMany(a => a.NotasAlumnos)
            .HasForeignKey(n => n.AlumnoID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NotaAlumno>()
            .HasOne(n => n.Asignatura)
            .WithMany(a => a.NotasAlumnos)
            .HasForeignKey(n => n.AsignaturaID)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
