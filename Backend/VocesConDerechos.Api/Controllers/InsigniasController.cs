using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Data;
using VocesConDerechos.Api.Models;
using VocesConDerechos.Api.DTOs;

namespace VocesConDerechos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InsigniasController : ControllerBase
{
    private readonly AppDbContext _context;

    public InsigniasController(AppDbContext context)
    {
        _context = context;
    }

    // POST: api/insignias/desbloquear
    [HttpPost("desbloquear")]
    public async Task<IActionResult> DesbloquearInsignia([FromBody] DesbloquearInsigniaDto dto)
    {
        // Verificar si ya tiene la insignia
        var existe = await _context.InsigniasEstudiante
            .AnyAsync(ie => ie.EstudianteId == dto.EstudianteId && ie.MisionId == dto.MisionId);

        if (existe)
        {
            return Ok(new { mensaje = "Insignia ya desbloqueada", nombre = await GetNombreInsignia(dto.MisionId) });
        }

        var insignia = new InsigniaEstudiante
        {
            EstudianteId = dto.EstudianteId,
            MisionId = dto.MisionId,
            FechaDesbloqueo = DateTime.UtcNow
        };

        _context.InsigniasEstudiante.Add(insignia);
        await _context.SaveChangesAsync();

        var nombre = await GetNombreInsignia(dto.MisionId);

        return Ok(new { mensaje = "Insignia desbloqueada", nombre });
    }

    private async Task<string> GetNombreInsignia(int misionId)
    {
        var mision = await _context.Misiones.FindAsync(misionId);
        return mision?.Titulo switch
        {
            "Igualdad" => "Promotor de la Igualdad",
            "Empatía" => "Embajador de la Empatía",
            "Respeto" => "Guardián del Respeto",
            "Prevención" => "Defensor de la Convivencia",
            _ => $"Maestro de {mision?.Titulo ?? "Misión"}"
        };
    }
}

