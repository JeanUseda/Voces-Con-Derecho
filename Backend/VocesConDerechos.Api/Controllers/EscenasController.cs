using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Data;
using VocesConDerechos.Api.Models;
using VocesConDerechos.Api.DTOs;

namespace VocesConDerechos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EscenasController : ControllerBase
{
    private readonly AppDbContext _context;

    public EscenasController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/escenas
    [HttpPost]
    public async Task<IActionResult> CrearEscena([FromBody] CrearEscenaDto dto)
    {
        var historiaExiste = await _context.Historias.AnyAsync(h => h.Id == dto.HistoriaId);
        if (!historiaExiste)
            return NotFound(new { mensaje = "La historia no existe." });

        var escena = new Escena
        {
            HistoriaId = dto.HistoriaId,
            Contenido = dto.Contenido,
            ImagenUrl = dto.ImagenUrl,
            Orden = dto.Orden,
            EsFinal = dto.EsFinal,
            TienePregunta = dto.TienePregunta
        };

        _context.Escenas.Add(escena);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Escena creada correctamente.",
            escena.Id,
            escena.HistoriaId,
            escena.Orden
        });
    }


    // PUT: api/escenas/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarEscena(int id, [FromBody] ActualizarEscenaDto dto)
    {
        var escena = await _context.Escenas.FindAsync(id);
        
        if (escena == null)
            return NotFound(new { mensaje = "Escena no encontrada." });

        escena.Contenido = dto.Contenido;
        escena.ImagenUrl = dto.ImagenUrl;
        escena.Orden = dto.Orden;
        escena.EsFinal = dto.EsFinal;
        escena.TienePregunta = dto.TienePregunta;

        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Escena actualizada correctamente." });
    }


    // GET: api/escenas
    [HttpGet]
    public async Task<IActionResult> GetEscenas()
    {
        var escenas = await _context.Escenas
            .OrderBy(e => e.HistoriaId)
            .ThenBy(e => e.Orden)
            .Select(e => new
            {
                e.Id,
                e.HistoriaId,
                e.Contenido,
                e.Orden,
                e.EsFinal,
                e.TienePregunta
            })
            .ToListAsync();

        return Ok(escenas);
    }

    // ==========================================
    // GET: api/escenas/historia/{historiaId}
    // Obtener escenas de una historia específica
    // ==========================================
    [HttpGet("historia/{historiaId}")]
    public async Task<IActionResult> GetEscenasByHistoria(int historiaId)
    {
        var escenas = await _context.Escenas
            .Where(e => e.HistoriaId == historiaId)
            .OrderBy(e => e.Orden)
            .Select(e => new
            {
                e.Id,
                e.Contenido,
                e.Orden,
                e.EsFinal,
                e.TienePregunta
            })
            .ToListAsync();

        return Ok(escenas);
    }

    // PUT: api/escenas/{id}/pregunta
    [HttpPut("{id}/pregunta")]
    public async Task<IActionResult> AsociarPregunta(int id, [FromBody] AsociarPreguntaDto dto)
    {
        var escena = await _context.Escenas.FindAsync(id);
        if (escena == null)
            return NotFound(new { mensaje = "Escena no encontrada." });

        var preguntaExiste = await _context.Preguntas.AnyAsync(p => p.Id == dto.PreguntaId);
        if (!preguntaExiste)
            return NotFound(new { mensaje = "Pregunta no encontrada." });

        escena.PreguntaId = dto.PreguntaId;
        escena.TienePregunta = true;

        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Pregunta asociada correctamente." });
    }

    // ==========================================
    // GET: api/escenas/{id}
    // Obtener una escena por ID
    // ==========================================
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEscenaById(int id)  // ✅ Cambiar nombre
    {
        var escena = await _context.Escenas
            .Where(e => e.Id == id)
            .Select(e => new
            {
                e.Id,
                e.HistoriaId,
                e.Contenido,
                e.Orden,
                e.EsFinal,
                e.TienePregunta
            })
            .FirstOrDefaultAsync();

        if (escena == null)
        {
            return NotFound(new { mensaje = "Escena no encontrada." });
        }

        return Ok(escena);
    }

    // ==========================================
    // DELETE: api/escenas/{id}
    // ==========================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarEscena(int id)
    {
        // 1. Buscar la escena
        var escena = await _context.Escenas
            .Include(e => e.Decisiones)
            .Include(e => e.Pregunta!)
                .ThenInclude(p => p.Respuestas)
            .FirstOrDefaultAsync(e => e.Id == id);
        
        if (escena == null)
        {
            return NotFound(new { mensaje = "Escena no encontrada." });
        }

        // 2. ✅ ELIMINAR PROGRESOS QUE APUNTEN A ESTA ESCENA
        var progresos = await _context.ProgresoHistorias
            .Where(p => p.EscenaActualId == id)
            .ToListAsync();
        
        if (progresos.Any())
        {
            _context.ProgresoHistorias.RemoveRange(progresos);
        }

        // 3. Eliminar decisiones
        if (escena.Decisiones.Any())
        {
            _context.Decisiones.RemoveRange(escena.Decisiones);
        }
        
        // 4. Eliminar pregunta y respuestas
        if (escena.Pregunta != null)
        {
            if (escena.Pregunta.Respuestas.Any())
            {
                _context.Respuestas.RemoveRange(escena.Pregunta.Respuestas);
            }
            _context.Preguntas.Remove(escena.Pregunta);
        }

        _context.Escenas.Remove(escena);

        await _context.SaveChangesAsync();

        return Ok(new 
        { 
            mensaje = "Escena eliminada correctamente.",
            progresosEliminados = progresos.Count 
        });
    }


}