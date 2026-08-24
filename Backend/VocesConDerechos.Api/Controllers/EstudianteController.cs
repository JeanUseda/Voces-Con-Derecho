using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Data;
using VocesConDerechos.Api.Models;
using VocesConDerechos.Api.DTOs;

namespace VocesConDerechos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EstudiantesController : ControllerBase
{
    private readonly AppDbContext _context;

    public EstudiantesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/estudiantes/todos
    [HttpGet("todos")]
    public async Task<IActionResult> GetTodosEstudiantes()
    {
        var estudiantes = await _context.Estudiantes
            .Where(e => e.Activo)
            .Select(e => new
            {
                e.Id,
                e.Nombre,
                e.Apellido,
                e.Email,
                e.EsSecundaria
            })
            .OrderBy(e => e.Nombre)
            .ThenBy(e => e.Apellido)
            .ToListAsync();

        return Ok(estudiantes);
    }

    // POST: api/estudiantes/registro
    [HttpPost("registro")]
    public async Task<IActionResult> RegistrarEstudiante(RegistroEstudianteDto dto)
    {
        // Verificar si el email ya existe
        var existe = await _context.Estudiantes
            .AnyAsync(e => e.Email == dto.Email);

        if (existe)
        {
            return BadRequest(new { mensaje = "El email ya está registrado." });
        }

        // Hash de la contraseña (usando BCrypt)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var estudiante = new Estudiante
        {
            Nombre = dto.Nombre,
            Apellido = dto.Apellido,
            Email = dto.Email,
            PasswordHash = passwordHash,
            EsSecundaria = dto.EsSecundaria,
            Activo = true,
            FechaRegistro = DateTime.UtcNow
        };

        _context.Estudiantes.Add(estudiante);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Estudiante registrado correctamente.",
            estudiante.Id,
            estudiante.Nombre,
            estudiante.Apellido,
            estudiante.Email
        });
    }

    // POST: api/estudiantes/login
    [HttpPost("login")]
    public async Task<IActionResult> LoginEstudiante(LoginEstudianteDto dto)
    {
        var estudiante = await _context.Estudiantes
            .FirstOrDefaultAsync(e => e.Email == dto.Email);

        if (estudiante == null)
        {
            return Unauthorized(new { mensaje = "Credenciales incorrectas." });
        }

        if (!estudiante.Activo)
        {
            return Unauthorized(new { mensaje = "Cuenta desactivada." });
        }

        // Verificar contraseña
        var passwordValida = BCrypt.Net.BCrypt.Verify(dto.Password, estudiante.PasswordHash);

        if (!passwordValida)
        {
            return Unauthorized(new { mensaje = "Credenciales incorrectas." });
        }

        // Obtener clases del estudiante
        var clases = await _context.ClaseEstudiantes
            .Where(ce => ce.EstudianteId == estudiante.Id && ce.Activo)
            .Select(ce => new ClaseEstudianteDto
            {
                ClaseId = ce.ClaseId,
                ClaseNombre = ce.Clase.Nombre,
                MisionesAsignadas = _context.ClaseMisiones
                    .Count(cm => cm.ClaseId == ce.ClaseId && cm.Activa)
            })
            .ToListAsync();

        var response = new EstudianteResponseDto
        {
            Id = estudiante.Id,
            Nombre = estudiante.Nombre,
            Apellido = estudiante.Apellido,
            Email = estudiante.Email,
            EsSecundaria = estudiante.EsSecundaria,
            Clases = clases
        };

        return Ok(response);
    }

    // GET: api/estudiantes/{id}/misiones
    [HttpGet("{id}/misiones")]
    public async Task<IActionResult> GetMisionesEstudiante(int id)
    {
        var estudiante = await _context.Estudiantes
            .FirstOrDefaultAsync(e => e.Id == id);

        if (estudiante == null)
        {
            return NotFound(new { mensaje = "Estudiante no encontrado." });
        }

        // Obtener misiones de todas las clases del estudiante
        var misiones = await _context.ClaseEstudiantes
            .Where(ce => ce.EstudianteId == id && ce.Activo)
            .SelectMany(ce => ce.Clase.Misiones)
            .Where(cm => cm.Activa)
            .Select(cm => new 
            {
                MisionId = cm.MisionId,
                Titulo = cm.Mision.Titulo,
                Descripcion = cm.Mision.Descripcion,
                ClaseId = cm.ClaseId,
                ClaseNombre = cm.Clase.Nombre, // 👈 CORREGIDO: acceso directo
                FechaAsignacion = cm.FechaAsignacion
            })
            .Distinct()
            .ToListAsync();

        return Ok(misiones);
    }

    // GET: api/estudiantes/{id}/progreso
    [HttpGet("{id}/progreso")]
    public async Task<IActionResult> GetProgresoEstudiante(int id)
    {
        var progreso = await _context.Progresos
            .Where(p => p.EstudianteId == id)
            .Select(p => new
            {
                p.MisionId,
                Titulo = p.Mision.Titulo,
                p.Estado,
                p.Puntos,
                p.FechaInicio,
                p.FechaFinalizacion
            })
            .ToListAsync();

        return Ok(progreso);
    }
}