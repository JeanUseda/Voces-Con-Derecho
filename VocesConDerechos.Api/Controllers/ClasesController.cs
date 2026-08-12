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

        // Verificar si ya está en la clase (incluso si está inactivo)
        var yaEstaEnClase = await _context.ClaseEstudiantes
            .AnyAsync(ce =>
                ce.ClaseId == claseId &&
                ce.EstudianteId == estudianteId);

        if (yaEstaEnClase)
        {
            // Si existe pero está inactivo, lo reactivamos
            var relacion = await _context.ClaseEstudiantes
                .FirstOrDefaultAsync(ce =>
                    ce.ClaseId == claseId &&
                    ce.EstudianteId == estudianteId);

            if (relacion != null && !relacion.Activo)
            {
                relacion.Activo = true;
                await _context.SaveChangesAsync();
                return Ok(new
                {
                    mensaje = "Estudiante reactivado correctamente.",
                    claseId,
                    estudianteId
                });
            }

            return BadRequest("El estudiante ya pertenece a esta clase.");
        }

        var claseEstudiante = new ClaseEstudiante
        {
            ClaseId = claseId,
            EstudianteId = estudianteId,
            Activo = true  
        };

        _context.ClaseEstudiantes.Add(claseEstudiante);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Estudiante agregado correctamente.",
            claseId,
            estudianteId
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
                ce.FechaIngreso,
                ce.Activo
            })
            .ToListAsync();

        return Ok(estudiantes);
    }

    // DELETE: api/clases/1/estudiantes/1 (desactivar lógico)
    [HttpDelete("{claseId}/estudiantes/{estudianteId}")]
    public async Task<IActionResult> DesactivarEstudiante(int claseId, int estudianteId)
    {
        var relacion = await _context.ClaseEstudiantes
            .FirstOrDefaultAsync(ce =>
                ce.ClaseId == claseId &&
                ce.EstudianteId == estudianteId);

        if (relacion == null)
        {
            return NotFound("El estudiante no está asignado a esta clase.");
        }

        if (!relacion.Activo)
        {
            return BadRequest("El estudiante ya está inactivo en esta clase.");
        }

        relacion.Activo = false;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Estudiante retirado correctamente (desactivado).",
            claseId,
            estudianteId,
            activo = false
        });
    }
}











// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using VocesConDerechos.Api.Data;
// using VocesConDerechos.Api.Models;
// using VocesConDerechos.Api.DTOs;

// namespace VocesConDerechos.Api.Controllers;

// [ApiController]
// [Route("api/[controller]")]
// public class ClasesController : ControllerBase
// {
//     private readonly AppDbContext _context;

//     public ClasesController(AppDbContext context)
//     {
//         _context = context;
//     }

//     // GET: api/clases?profesorId=1
//     [HttpGet]
//     public async Task<IActionResult> GetClases(int profesorId)
//     {
//         var clases = await _context.Clases
//             .Where(c => c.ProfesorId == profesorId)
//             .Select(c => new
//             {
//                 c.Id,
//                 c.Nombre,
//                 c.ProfesorId
//             })
//             .ToListAsync();

//         return Ok(clases);
//     }

//     // POST: api/clases
//     [HttpPost]
//     public async Task<IActionResult> CrearClase(CrearClaseDto dto)
//     {
//         var profesorExiste = await _context.Profesores
//             .AnyAsync(p => p.Id == dto.ProfesorId);

//         if (!profesorExiste)
//         {
//             return BadRequest("El profesor no existe.");
//         }

//         var clase = new Clase
//         {
//             Nombre = dto.Nombre,
//             Nivel = dto.Nivel,
//             ProfesorId = dto.ProfesorId
//         };

//         _context.Clases.Add(clase);

//         await _context.SaveChangesAsync();

//         return CreatedAtAction(
//             nameof(GetClase),
//             new { id = clase.Id },
//             clase
//         );
//     }

//     // GET: api/clases/1
//     [HttpGet("{id}")]
//     public async Task<IActionResult> GetClase(int id)
//     {
//         var clase = await _context.Clases
//             .Where(c => c.Id == id)
//             .Select(c => new
//             {
//                 c.Id,
//                 c.Nombre,
//                 c.ProfesorId
//             })
//             .FirstOrDefaultAsync();

//         if (clase == null)
//         {
//             return NotFound("La clase no existe.");
//         }

//         return Ok(clase);
//     }

//     // POST: api/clases/1/estudiantes
//     [HttpPost("{claseId}/estudiantes")]
//     public async Task<IActionResult> AgregarEstudiante(
//         int claseId,
//         int estudianteId)
//     {
//         var claseExiste = await _context.Clases
//             .AnyAsync(c => c.Id == claseId);

//         if (!claseExiste)
//         {
//             return NotFound("La clase no existe.");
//         }

//         var estudianteExiste = await _context.Estudiantes
//             .AnyAsync(e => e.Id == estudianteId);

//         if (!estudianteExiste)
//         {
//             return NotFound("El estudiante no existe.");
//         }

//         var yaEstaEnClase = await _context.ClaseEstudiantes
//             .AnyAsync(ce =>
//                 ce.ClaseId == claseId &&
//                 ce.EstudianteId == estudianteId);

//         if (yaEstaEnClase)
//         {
//             return BadRequest("El estudiante ya pertenece a esta clase.");
//         }

//         var claseEstudiante = new ClaseEstudiante
//         {
//             ClaseId = claseId,
//             EstudianteId = estudianteId
//         };

//         _context.ClaseEstudiantes.Add(claseEstudiante);

//         await _context.SaveChangesAsync();

//         return Ok(new
//         {
//             mensaje = "Estudiante agregado correctamente.",
//             claseId,
//             estudianteId
//         });
//     }

//     // GET: api/clases/1/estudiantes
//     [HttpGet("{claseId}/estudiantes")]
//     public async Task<IActionResult> GetEstudiantesDeClase(int claseId)
//     {
//         var claseExiste = await _context.Clases
//             .AnyAsync(c => c.Id == claseId);

//         if (!claseExiste)
//         {
//             return NotFound("La clase no existe.");
//         }

//         var estudiantes = await _context.ClaseEstudiantes
//             .Where(ce => ce.ClaseId == claseId)
//             .Select(ce => new
//             {
//                 ce.EstudianteId,
//                 ce.Estudiante.Nombre,
//                 ce.Estudiante.Apellido,
//                 ce.FechaIngreso
//             })
//             .ToListAsync();

//         return Ok(estudiantes);
//     }
// }