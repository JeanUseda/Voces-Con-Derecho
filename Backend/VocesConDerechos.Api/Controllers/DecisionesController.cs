using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Data;
using VocesConDerechos.Api.Models;
using VocesConDerechos.Api.DTOs;

namespace VocesConDerechos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DecisionesController : ControllerBase
{
    private readonly AppDbContext _context;

    public DecisionesController(AppDbContext context)
    {
        _context = context;
    }


    // ==========================================
    // GET: api/decisiones
    // Obtener todas las decisiones
    // ==========================================
    [HttpGet]
    public async Task<IActionResult> GetDecisiones()
    {
        var decisiones = await _context.Decisiones
            .Select(d => new
            {
                d.Id,
                d.EscenaId,
                d.Texto,
                d.SiguienteEscenaId,
                d.Puntos,
                d.EsCorrecta,
                d.Retroalimentacion
            })
            .ToListAsync();

        return Ok(decisiones);
    }

    // POST: api/decisiones
    [HttpPost]
    public async Task<IActionResult> CrearDecision([FromBody] CrearDecisionDto dto)
    {
        var escenaExiste = await _context.Escenas.AnyAsync(e => e.Id == dto.EscenaId);
        if (!escenaExiste)
            return NotFound(new { mensaje = "La escena no existe." });

        var decision = new Decision
        {
            EscenaId = dto.EscenaId,
            Texto = dto.Texto,
            SiguienteEscenaId = dto.SiguienteEscenaId,
            Puntos = dto.Puntos,
            EsCorrecta = dto.EsCorrecta,
            Retroalimentacion = dto.Retroalimentacion
        };

        _context.Decisiones.Add(decision);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Decisión creada correctamente.",
            decision.Id,
            decision.EscenaId
        });
    }


    // DELETE: api/decisiones/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarDecision(int id)
    {
        var decision = await _context.Decisiones.FindAsync(id);
        
        if (decision == null)
            return NotFound(new { mensaje = "Decisión no encontrada." });

        _context.Decisiones.Remove(decision);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Decisión eliminada correctamente." });
    }

    // PUT: api/decisiones/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarDecision(int id, [FromBody] ActualizarDecisionDto dto)
    {
        var decision = await _context.Decisiones.FindAsync(id);
        
        if (decision == null)
        {
            return NotFound(new { mensaje = "Decisión no encontrada." });
        }

        // Actualizar todos los campos
        decision.Texto = dto.Texto;
        decision.SiguienteEscenaId = dto.SiguienteEscenaId;
        decision.Puntos = dto.Puntos;
        decision.EsCorrecta = dto.EsCorrecta;
        decision.Retroalimentacion = dto.Retroalimentacion;

        await _context.SaveChangesAsync();

        return Ok(new { 
            mensaje = "Decisión actualizada correctamente.",
            decision.Id,
            decision.SiguienteEscenaId
        });
    }

}