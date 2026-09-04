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

    // ==========================================
    // POST: api/profesores/login
    // ==========================================
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

        var passwordValida = BCrypt.Net.BCrypt.Verify(dto.Password, profesor.PasswordHash);

        if (!passwordValida)
        {
            return Unauthorized(new { mensaje = "Credenciales incorrectas." });
        }

        // Detectar rol
        string rol = profesor.Rol ?? "profesor";
        if (profesor.Email.Contains("@Secre.com")) rol = "admin";

        // Estadísticas
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
            profesor.Apellido,
            profesor.Email,
            Rol = rol,
            totalClases,
            totalEstudiantes,
            totalMisiones
        });
    }

    // ==========================================
    // POST: api/profesores/registro
    // ==========================================

// POST: api/profesores/registro
[HttpPost("registro")]
public async Task<IActionResult> RegistrarProfesor(RegistroProfesorDto dto)
{
    // Verificar si el email ya existe
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
        Apellido = dto.Apellido ?? "",
        Email = dto.Email!,  // ✅ Usar el email que viene del frontend
        PasswordHash = passwordHash,
        Rol = dto.Rol ?? "profesor",
        Activo = true,
        FechaRegistro = DateTime.UtcNow
    };

    _context.Profesores.Add(profesor);
    await _context.SaveChangesAsync();

    return Ok(new
    {
        mensaje = "Usuario registrado correctamente.",
        profesor.Id,
        profesor.Nombre,
        profesor.Apellido,
        profesor.Email,
        profesor.Rol
    });
}
    // ==========================================
    // GET: api/profesores (solo admin)
    // ==========================================
    [HttpGet]
    public async Task<IActionResult> GetProfesores()
    {
        var profesores = await _context.Profesores
            .Where(p => p.Rol != "admin")
            .Select(p => new
            {
                p.Id,
                p.Nombre,
                p.Apellido,
                p.Email,
                p.Rol,
                p.Activo,
                p.FechaRegistro,
                TotalClases = _context.Clases.Count(c => c.ProfesorId == p.Id)
            })
            .OrderBy(p => p.Nombre)
            .ToListAsync();

        return Ok(profesores);
    }

    // ==========================================
    // DELETE: api/profesores/{id} (solo admin)
    // ==========================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarProfesor(int id)
    {
        var profesor = await _context.Profesores.FindAsync(id);

        if (profesor == null)
        {
            return NotFound(new { mensaje = "Profesor no encontrado." });
        }

        if (profesor.Rol == "admin")
        {
            return BadRequest(new { mensaje = "No se puede eliminar al administrador." });
        }

        // Verificar si tiene clases
        var tieneClases = await _context.Clases.AnyAsync(c => c.ProfesorId == id);
        if (tieneClases)
        {
            return BadRequest(new { mensaje = "No se puede eliminar el profesor porque tiene clases asignadas." });
        }

        _context.Profesores.Remove(profesor);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Profesor eliminado correctamente." });
    }

    // ==========================================
    // GET: api/profesores/clases/{profesorId}
    // ==========================================
    [HttpGet("clases/{profesorId}")]
    public async Task<IActionResult> GetClasesDeProfesor(int profesorId)
    {
        var profesor = await _context.Profesores.FindAsync(profesorId);
        if (profesor == null)
        {
            return NotFound(new { mensaje = "Profesor no encontrado." });
        }

        var clases = await _context.Clases
            .Where(c => c.ProfesorId == profesorId)
            .Select(c => new
            {
                c.Id,
                c.Nombre,
                c.Nivel,
                TotalEstudiantes = _context.ClaseEstudiantes.Count(ce => ce.ClaseId == c.Id && ce.Activo)
            })
            .ToListAsync();

        return Ok(clases);
    }
    // ==========================================
    // PUT: api/profesores/{id} (actualizar profesor)
    // ==========================================
    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarProfesor(int id, ActualizarProfesorDto dto)
    {
        var profesor = await _context.Profesores.FindAsync(id);

        if (profesor == null)
        {
            return NotFound(new { mensaje = "Profesor no encontrado." });
        }

        if (profesor.Rol == "admin")
        {
            return BadRequest(new { mensaje = "No se puede modificar al administrador." });
        }

        // Actualizar nombre y apellido si se enviaron
        if (!string.IsNullOrEmpty(dto.Nombre))
        {
            profesor.Nombre = dto.Nombre;
        }

        if (!string.IsNullOrEmpty(dto.Apellido))
        {
            profesor.Apellido = dto.Apellido;
        }

        // Actualizar estado activo/inactivo
        if (dto.Activo.HasValue)
        {
            profesor.Activo = dto.Activo.Value;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Profesor actualizado correctamente.",
            profesor.Id,
            profesor.Nombre,
            profesor.Apellido,
            profesor.Activo
        });
    }

    // ==========================================
    // PUT: api/profesores/{id}/password (resetear contraseña)
    // ==========================================
    [HttpPut("{id}/password")]
    public async Task<IActionResult> ResetearPassword(int id, ResetPasswordDto dto)
    {
        var profesor = await _context.Profesores.FindAsync(id);

        if (profesor == null)
        {
            return NotFound(new { mensaje = "Profesor no encontrado." });
        }

        if (string.IsNullOrEmpty(dto.NuevaPassword) || dto.NuevaPassword.Length < 6)
        {
            return BadRequest(new { mensaje = "La contraseña debe tener al menos 6 caracteres." });
        }

        profesor.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NuevaPassword);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Contraseña actualizada correctamente." });
    }
}