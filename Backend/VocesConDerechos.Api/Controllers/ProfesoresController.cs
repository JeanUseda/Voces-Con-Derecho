using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Data;
using VocesConDerechos.Api.Models;
using VocesConDerechos.Api.DTOs;

namespace VocesConDerechos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfesoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfesoresController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/profesores/login
    [HttpPost("login")]
    public async Task<IActionResult> LoginProfesor(LoginProfesorDto dto)
    {
        var profesor = await _context.Profesores
            .FirstOrDefaultAsync(p => p.Email == dto.Email);

        if (profesor == null)
        {
            return Unauthorized(new { mensaje = "Credenciales incorrectas." });
        }

        if (!profesor.Activo)
        {
            return Unauthorized(new { mensaje = "Cuenta desactivada." });
        }

        // Verificar contraseña (usando BCrypt)
        var passwordValida = BCrypt.Net.BCrypt.Verify(dto.Password, profesor.PasswordHash);

        if (!passwordValida)
        {
            return Unauthorized(new { mensaje = "Credenciales incorrectas." });
        }

        // Obtener estadísticas del profesor
        var totalClases = await _context.Clases
            .CountAsync(c => c.ProfesorId == profesor.Id);

        var totalEstudiantes = await _context.ClaseEstudiantes
            .Where(ce => ce.Clase.ProfesorId == profesor.Id && ce.Activo)
            .Select(ce => ce.EstudianteId)
            .Distinct()
            .CountAsync();

        var totalMisiones = await _context.Misiones
            .CountAsync(m => m.ProfesorId == profesor.Id || m.EsGlobal);

        return Ok(new
        {
            profesor.Id,
            profesor.Nombre,
            profesor.Email,
            totalClases,
            totalEstudiantes,
            totalMisiones
        });
    }
        
    // POST: api/profesores/registro
    [HttpPost("registro")]
    public async Task<IActionResult> RegistrarProfesor(RegistroProfesorDto dto)
    {
        var existe = await _context.Profesores
            .AnyAsync(p => p.Email == dto.Email);

        if (existe)
        {
            return BadRequest(new { mensaje = "El email ya está registrado." });
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var profesor = new Profesor
        {
            Nombre = dto.Nombre,
            Email = dto.Email,
            PasswordHash = passwordHash,
            Activo = true,
            FechaRegistro = DateTime.UtcNow
        };

        _context.Profesores.Add(profesor);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Profesor registrado correctamente.",
            profesor.Id,
            profesor.Nombre,
            profesor.Email
        });
    }

}