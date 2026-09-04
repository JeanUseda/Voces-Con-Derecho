using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Data;
using VocesConDerechos.Api.Models;
using VocesConDerechos.Api.DTOs;

namespace VocesConDerechos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PreguntasController : ControllerBase
{
    private readonly AppDbContext _context;

    public PreguntasController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/preguntas
    [HttpPost]
    public async Task<IActionResult> CrearPregunta([FromBody] CrearPreguntaDto dto)
    {
        var pregunta = new Pregunta
        {
            Enunciado = dto.Enunciado,
            Explicacion = dto.Explicacion,
            Puntos = dto.Puntos
        };

        _context.Preguntas.Add(pregunta);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Pregunta creada correctamente.",
            pregunta.Id
        });
    }

    // POST: api/preguntas/{id}/respuestas
    [HttpPost("{id}/respuestas")]
    public async Task<IActionResult> AgregarRespuesta(int id, [FromBody] AgregarRespuestaDto dto)
    {
        var preguntaExiste = await _context.Preguntas.AnyAsync(p => p.Id == id);
        if (!preguntaExiste)
            return NotFound(new { mensaje = "La pregunta no existe." });

        var respuesta = new Respuesta
        {
            PreguntaId = id,
            Texto = dto.Texto,
            EsCorrecta = dto.EsCorrecta
        };

        _context.Respuestas.Add(respuesta);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Respuesta agregada correctamente.",
            respuesta.Id
        });
    }

    // DELETE: api/preguntas/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarPregunta(int id)
    {
        var pregunta = await _context.Preguntas
            .Include(p => p.Respuestas)
            .FirstOrDefaultAsync(p => p.Id == id);
        
        if (pregunta == null)
            return NotFound(new { mensaje = "Pregunta no encontrada." });

        _context.Preguntas.Remove(pregunta);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Pregunta eliminada correctamente." });
    }

    // DELETE: api/preguntas/{id}/respuestas/{respuestaId}
    [HttpDelete("{id}/respuestas/{respuestaId}")]
    public async Task<IActionResult> EliminarRespuesta(int id, int respuestaId)
    {
        var respuesta = await _context.Respuestas
            .FirstOrDefaultAsync(r => r.Id == respuestaId && r.PreguntaId == id);
        
        if (respuesta == null)
            return NotFound(new { mensaje = "Respuesta no encontrada." });

        _context.Respuestas.Remove(respuesta);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Respuesta eliminada correctamente." });
    }
}