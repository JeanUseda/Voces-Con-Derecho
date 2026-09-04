using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Data;
using VocesConDerechos.Api.Models;
using VocesConDerechos.Api.DTOs;

namespace VocesConDerechos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClasesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClasesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/clases?profesorId=1
    [HttpGet]
    public async Task<IActionResult> GetClases(int profesorId)
    {
        var clases = await _context.Clases
            .Where(c => c.ProfesorId == profesorId)
            .Select(c => new
            {
                c.Id,
                c.Nombre,
                c.ProfesorId
            })
            .ToListAsync();

        return Ok(clases);
    }

    // POST: api/clases
    [HttpPost]
    public async Task<IActionResult> CrearClase(CrearClaseDto dto)
    {
        var profesorExiste = await _context.Profesores
            .AnyAsync(p => p.Id == dto.ProfesorId);

        if (!profesorExiste)
        {
            return BadRequest("El profesor no existe.");
        }

        var clase = new Clase
        {
            Nombre = dto.Nombre,
            Nivel = dto.Nivel,
            ProfesorId = dto.ProfesorId
        };

        _context.Clases.Add(clase);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetClase),
            new { id = clase.Id },
            clase
        );
    }

    // GET: api/clases/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetClase(int id)
    {
        var clase = await _context.Clases
            .Where(c => c.Id == id)
            .Select(c => new
            {
                c.Id,
                c.Nombre,
                c.ProfesorId
            })
            .FirstOrDefaultAsync();

        if (clase == null)
        {
            return NotFound("La clase no existe.");
        }

        return Ok(clase);
    }

    // POST: api/clases/1/estudiantes
    [HttpPost("{claseId}/estudiantes")]
    public async Task<IActionResult> AgregarEstudiante(
        int claseId,
        int estudianteId)
    {
        var claseExiste = await _context.Clases
            .AnyAsync(c => c.Id == claseId);

        if (!claseExiste)
        {
            return NotFound("La clase no existe.");
        }

        var estudianteExiste = await _context.Estudiantes
            .AnyAsync(e => e.Id == estudianteId);

        if (!estudianteExiste)
        {
            return NotFound("El estudiante no existe.");
        }

        var relacion = await _context.ClaseEstudiantes
            .FirstOrDefaultAsync(ce =>
                ce.ClaseId == claseId &&
                ce.EstudianteId == estudianteId);

        // La relación no existe: crearla
        if (relacion == null)
        {
            relacion = new ClaseEstudiante
            {
                ClaseId = claseId,
                EstudianteId = estudianteId,
                Activo = true
            };

            _context.ClaseEstudiantes.Add(relacion);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Estudiante agregado correctamente.",
                claseId,
                estudianteId,
                activo = true
            });
        }

        // La relación existe y ya está activa
        if (relacion.Activo)
        {
            return BadRequest("El estudiante ya pertenece a esta clase.");
        }

        // La relación existe pero estaba desactivada: reactivar
        relacion.Activo = true;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Estudiante reactivado correctamente.",
            claseId,
            estudianteId,
            activo = true
        });
    }

    // GET: api/clases/1/estudiantes
    [HttpGet("{claseId}/estudiantes")]
    public async Task<IActionResult> GetEstudiantesDeClase(int claseId)
    {
        var claseExiste = await _context.Clases
            .AnyAsync(c => c.Id == claseId);

        if (!claseExiste)
        {
            return NotFound("La clase no existe.");
        }

        var estudiantes = await _context.ClaseEstudiantes
            .Where(ce => ce.ClaseId == claseId && ce.Activo)
            .Select(ce => new
            {
                ce.EstudianteId,
                ce.Estudiante.Nombre,
                ce.Estudiante.Apellido,
                ce.FechaIngreso
            })
            .ToListAsync();

        return Ok(estudiantes);
    }

    // GET: api/clases/1/estudiantes/inactivos
    [HttpGet("{claseId}/estudiantes/inactivos")]
    public async Task<IActionResult> GetEstudiantesInactivos(int claseId)
    {
        var claseExiste = await _context.Clases
            .AnyAsync(c => c.Id == claseId);

        if (!claseExiste)
        {
            return NotFound("La clase no existe.");
        }

        var estudiantes = await _context.ClaseEstudiantes
            .Where(ce =>
                ce.ClaseId == claseId &&
                !ce.Activo)
            .Select(ce => new
            {
                ce.EstudianteId,
                ce.Estudiante.Nombre,
                ce.Estudiante.Apellido,
                ce.FechaIngreso,
                ce.Activo
            })
            .ToListAsync();

        return Ok(estudiantes);
    }

    // PATCH: api/clases/1/estudiantes/1/desactivar
    [HttpPatch("{claseId}/estudiantes/{estudianteId}/desactivar")]
    public async Task<IActionResult> DesactivarEstudiante(
        int claseId,
        int estudianteId)
    {
        var relacion = await _context.ClaseEstudiantes
            .FirstOrDefaultAsync(ce =>
                ce.ClaseId == claseId &&
                ce.EstudianteId == estudianteId);

        if (relacion == null)
        {
            return NotFound("El estudiante no pertenece a esta clase.");
        }

        if (!relacion.Activo)
        {
            return BadRequest("El estudiante ya está desactivado.");
        }

        relacion.Activo = false;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Estudiante desactivado correctamente.",
            claseId,
            estudianteId,
            activo = false
        });
    }

    // GET: api/clases/1/misiones
    [HttpGet("{claseId}/misiones")]
    public async Task<IActionResult> GetMisionesDeClase(int claseId)
    {
        var claseExiste = await _context.Clases
            .AnyAsync(c => c.Id == claseId);

        if (!claseExiste)
        {
            return NotFound("La clase no existe.");
        }

        var misiones = await _context.ClaseMisiones
            .Where(cm => cm.ClaseId == claseId && cm.Activa)
            .Select(cm => new
            {
                cm.MisionId,
                cm.Mision.Titulo,
                cm.Mision.Descripcion,
                cm.FechaAsignacion,
                cm.Activa
            })
            .ToListAsync();

        return Ok(misiones);
    }

    // POST: api/clases/1/misiones/1
    [HttpPost("{claseId}/misiones/{misionId}")]
    public async Task<IActionResult> AsignarMision(
        int claseId,
        int misionId)
    {
        // Verificar que la clase exista
        var claseExiste = await _context.Clases
            .AnyAsync(c => c.Id == claseId);

        if (!claseExiste)
        {
            return NotFound("La clase no existe.");
        }

        // Verificar que la misión exista
        var misionExiste = await _context.Misiones
            .AnyAsync(m => m.Id == misionId);

        if (!misionExiste)
        {
            return NotFound("La misión no existe.");
        }

        // Buscar si ya existe la relación
        var relacion = await _context.ClaseMisiones
            .FirstOrDefaultAsync(cm =>
                cm.ClaseId == claseId &&
                cm.MisionId == misionId);

        // No existe: crear relación
        if (relacion == null)
        {
            relacion = new ClaseMision
            {
                ClaseId = claseId,
                MisionId = misionId,
                FechaAsignacion = DateTime.UtcNow,
                Activa = true
            };

            _context.ClaseMisiones.Add(relacion);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Misión asignada correctamente.",
                claseId,
                misionId,
                activa = true
            });
        }

        // Ya existe y está activa
        if (relacion.Activa)
        {
            return BadRequest("La misión ya está asignada a esta clase.");
        }

        // Existe pero estaba inactiva: reactivar
        relacion.Activa = true;
        relacion.FechaAsignacion = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Misión reactivada correctamente.",
            claseId,
            misionId,
            activa = true
        });
    }

}