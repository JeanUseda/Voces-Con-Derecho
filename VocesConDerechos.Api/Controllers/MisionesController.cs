using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Data;
using VocesConDerechos.Api.DTOs;
using VocesConDerechos.Api.Models;

namespace VocesConDerechos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MisionesController : ControllerBase
{
    private readonly AppDbContext _context;

    public MisionesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/misiones
    [HttpGet]
    public async Task<IActionResult> GetMisiones()
    {
        var misiones = await _context.Misiones
            .Select(m => new
            {
                m.Id,
                m.Titulo,
                m.Descripcion,
                m.EsGlobal,
                m.ProfesorId
            })
            .ToListAsync();

        return Ok(misiones);
    }

    // POST: api/misiones
    [HttpPost]
    public async Task<IActionResult> CrearMision(CrearMisionDto dto)
    {
        // Si es personalizada, debe existir el profesor
        if (!dto.EsGlobal)
        {
            if (dto.ProfesorId == null)
            {
                return BadRequest(
                    "Una misión personalizada debe tener un profesor."
                );
            }

            var profesorExiste = await _context.Profesores
                .AnyAsync(p => p.Id == dto.ProfesorId);

            if (!profesorExiste)
            {
                return NotFound("El profesor no existe.");
            }
        }

        // Una misión global no pertenece a un profesor
        if (dto.EsGlobal)
        {
            dto.ProfesorId = null;
        }

        var mision = new Mision
        {
            Titulo = dto.Titulo,
            Descripcion = dto.Descripcion,
            EsGlobal = dto.EsGlobal,
            ProfesorId = dto.ProfesorId
        };

        _context.Misiones.Add(mision);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Misión creada correctamente.",
            mision.Id,
            mision.Titulo,
            mision.Descripcion,
            mision.EsGlobal,
            mision.ProfesorId
        });
    }

    // POST: api/misiones/1/clases/1
    [HttpPost("{misionId}/clases/{claseId}")]
    public async Task<IActionResult> AsignarMisionAClase(
        int misionId,
        int claseId)
    {
        var misionExiste = await _context.Misiones
            .AnyAsync(m => m.Id == misionId);

        if (!misionExiste)
        {
            return NotFound("La misión no existe.");
        }

        var claseExiste = await _context.Clases
            .AnyAsync(c => c.Id == claseId);

        if (!claseExiste)
        {
            return NotFound("La clase no existe.");
        }

        var relacion = await _context.ClaseMisiones
            .FirstOrDefaultAsync(cm =>
                cm.ClaseId == claseId &&
                cm.MisionId == misionId);

        // Ya existe la relación
        if (relacion != null)
        {
            if (relacion.Activa)
            {
                return BadRequest(
                    "La misión ya está asignada a esta clase."
                );
            }

            // Reactivar asignación
            relacion.Activa = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Misión reactivada correctamente.",
                claseId,
                misionId,
                activa = true
            });
        }

        // Crear nueva asignación
        relacion = new ClaseMision
        {
            ClaseId = claseId,
            MisionId = misionId,
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
}