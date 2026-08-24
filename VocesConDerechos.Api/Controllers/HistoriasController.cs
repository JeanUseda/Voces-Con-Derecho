using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Data;
using VocesConDerechos.Api.DTOs;
using VocesConDerechos.Api.Models;

namespace VocesConDerechos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistoriasController : ControllerBase
{
    private readonly AppDbContext _context;

    public HistoriasController(AppDbContext context)
    {
        _context = context;
    }

    // ==========================================
    // GET: api/historias
    // Obtener todas las historias
    // ==========================================
    [HttpGet]
    public async Task<IActionResult> GetHistorias()
    {
        var historias = await _context.Historias
            .OrderBy(h => h.MisionId)
            .ThenBy(h => h.Orden)
            .Select(h => new
            {
                h.Id,
                h.Titulo,
                Descripcion = h.Descripcion ?? "Sin descripción",  // ✅ CORREGIDO
                h.MisionId,
                h.Orden,
                h.PuntosBase,
                h.Activa
            })
            .ToListAsync();

        return Ok(historias);
    }

    // ==========================================
    // GET: api/historias/mision/{misionId}
    // Obtener todas las historias de una misión
    // ==========================================
    [HttpGet("mision/{misionId}")]
    public async Task<IActionResult> GetHistoriasByMision(int misionId)
    {
        var historias = await _context.Historias
            .Where(h => h.MisionId == misionId && h.Activa)
            .OrderBy(h => h.Orden)
            .Select(h => new
            {
                h.Id,
                h.Titulo,
                Descripcion = h.Descripcion ?? "Sin descripción",  // ✅ CORREGIDO
                h.Orden,
                h.PuntosBase
            })
            .ToListAsync();

        return Ok(historias);
    }
    // ==========================================
    // GET: api/historias/{id}/jugar
    // Obtener una historia completa para jugar
    // ==========================================
    [HttpGet("{id}/jugar")]
    public async Task<IActionResult> GetHistoriaParaJugar(int id)
    {
        var historia = await _context.Historias
            .Include(h => h.Escenas)
                .ThenInclude(e => e.Decisiones)
            .Include(h => h.Escenas)
                .ThenInclude(e => e.Pregunta!)
                    .ThenInclude(p => p.Respuestas)
            .FirstOrDefaultAsync(h => h.Id == id && h.Activa);

        if (historia == null)
        {
            return NotFound(new { mensaje = "Historia no encontrada." });
        }

        var escenasDto = historia.Escenas
            .OrderBy(e => e.Orden)
            .Select(e => new EscenaDto
            {
                Id = e.Id,
                Contenido = e.Contenido,
                ImagenUrl = e.ImagenUrl,
                Orden = e.Orden,
                EsFinal = e.EsFinal,
                TienePregunta = e.TienePregunta,
                Decisiones = e.Decisiones.Select(d => new DecisionDto
                {
                    Id = d.Id,
                    Texto = d.Texto,
                    SiguienteEscenaId = d.SiguienteEscenaId,
                    Puntos = d.Puntos,
                    EsCorrecta = d.EsCorrecta,
                    Retroalimentacion = d.Retroalimentacion
                }).ToList(),
                Pregunta = e.Pregunta != null ? new PreguntaDto
                {
                    Id = e.Pregunta.Id,
                    Enunciado = e.Pregunta.Enunciado,
                    Explicacion = e.Pregunta.Explicacion,
                    Puntos = e.Pregunta.Puntos,
                    Respuestas = e.Pregunta.Respuestas.Select(r => new RespuestaDto
                    {
                        Id = r.Id,
                        Texto = r.Texto,
                        EsCorrecta = r.EsCorrecta
                    }).ToList()
                } : null
            }).ToList();

        return Ok(new
        {
            historia.Id,
            historia.Titulo,
            historia.Descripcion,
            historia.PuntosBase,
            Escenas = escenasDto
        });
    }

    // ==========================================
    // GET: api/historias/progreso/{estudianteId}/{historiaId}
    // Obtener progreso de una historia específica
    // ==========================================
    [HttpGet("progreso/{estudianteId}/{historiaId}")]
    public async Task<IActionResult> GetProgresoHistoria(int estudianteId, int historiaId)
    {
        var progreso = await _context.ProgresoHistorias
            .FirstOrDefaultAsync(ph => ph.EstudianteId == estudianteId && ph.HistoriaId == historiaId);

        if (progreso == null)
        {
            return Ok(new
            {
                Completada = false,
                PuntosObtenidos = 0,
                EscenaActualId = (int?)null
            });
        }

        return Ok(new
        {
            progreso.Completada,
            progreso.PuntosObtenidos,
            progreso.EscenaActualId
        });
    }

    // ==========================================
    // GET: api/historias/progreso/mision/{estudianteId}/{misionId}
    // Obtener progreso de todas las historias de una misión
    // ==========================================
    [HttpGet("progreso/mision/{estudianteId}/{misionId}")]
    public async Task<IActionResult> GetProgresoMision(int estudianteId, int misionId)
    {
        // Obtener todas las historias de la misión
        var historias = await _context.Historias
            .Where(h => h.MisionId == misionId && h.Activa)
            .Select(h => h.Id)
            .ToListAsync();

        if (historias.Count == 0)
        {
            return Ok(new List<object>());
        }

        // Obtener el progreso del estudiante en estas historias
        var progreso = await _context.ProgresoHistorias
            .Where(ph => ph.EstudianteId == estudianteId && historias.Contains(ph.HistoriaId))
            .Select(ph => new
            {
                ph.HistoriaId,
                ph.Completada,
                ph.PuntosObtenidos,
                ph.EscenaActualId
            })
            .ToListAsync();

        // Incluir historias sin progreso (no iniciadas)
        var resultado = historias.Select(hId => new
        {
            HistoriaId = hId,
            Completada = progreso.Any(p => p.HistoriaId == hId && p.Completada),
            PuntosObtenidos = progreso.FirstOrDefault(p => p.HistoriaId == hId)?.PuntosObtenidos ?? 0,
            EscenaActualId = progreso.FirstOrDefault(p => p.HistoriaId == hId)?.EscenaActualId
        });

        return Ok(resultado);
    }

    // ==========================================
    // GET: api/historias/mision/{misionId}/progreso/{estudianteId}
    // Obtener progreso detallado de una misión (con nombres de historias)
    // ==========================================
    [HttpGet("mision/{misionId}/progreso/{estudianteId}")]
    public async Task<IActionResult> GetProgresoMisionDetallado(int misionId, int estudianteId)
    {
        var historias = await _context.Historias
            .Where(h => h.MisionId == misionId && h.Activa)
            .OrderBy(h => h.Orden)
            .ToListAsync();

        if (!historias.Any())
        {
            return Ok(new
            {
                MisionId = misionId,
                Titulo = "Sin historias",
                TotalHistorias = 0,
                HistoriasCompletadas = 0,
                PuntosTotales = 0,
                Completada = false,
                Historias = new List<object>()
            });
        }

        var progresos = await _context.ProgresoHistorias
            .Where(ph => ph.EstudianteId == estudianteId && 
                         historias.Select(h => h.Id).Contains(ph.HistoriaId))
            .ToListAsync();

        var historiasDto = historias.Select(h => new
        {
            h.Id,
            h.Titulo,
            Completada = progresos.Any(p => p.HistoriaId == h.Id && p.Completada),
            Puntos = progresos.FirstOrDefault(p => p.HistoriaId == h.Id)?.PuntosObtenidos ?? 0,
            FechaCompletada = progresos.FirstOrDefault(p => p.HistoriaId == h.Id && p.Completada)?.FechaCompletada
        }).ToList();

        var completadas = historiasDto.Count(h => h.Completada);
        var totalPuntos = historiasDto.Sum(h => h.Puntos);

        var resultado = new
        {
            MisionId = misionId,
            Titulo = await _context.Misiones.Where(m => m.Id == misionId).Select(m => m.Titulo).FirstOrDefaultAsync() ?? "",
            TotalHistorias = historias.Count,
            HistoriasCompletadas = completadas,
            PuntosTotales = totalPuntos,
            Completada = completadas == historias.Count && historias.Count > 0,
            Historias = historiasDto
        };

        return Ok(resultado);
    }

    // ==========================================
    // GET: api/historias/mision/{misionId}/siguiente/{estudianteId}
    // Obtener la siguiente historia no completada
    // ==========================================
    [HttpGet("mision/{misionId}/siguiente/{estudianteId}")]
    public async Task<IActionResult> GetSiguienteHistoria(int misionId, int estudianteId)
    {
        var historias = await _context.Historias
            .Where(h => h.MisionId == misionId && h.Activa)
            .OrderBy(h => h.Orden)
            .ToListAsync();

        if (!historias.Any())
        {
            return NotFound(new { mensaje = "No hay historias en esta misión." });
        }

        var progresos = await _context.ProgresoHistorias
            .Where(ph => ph.EstudianteId == estudianteId && 
                         historias.Select(h => h.Id).Contains(ph.HistoriaId))
            .ToListAsync();

        // Buscar la primera historia no completada
        var siguiente = historias
            .FirstOrDefault(h => !progresos.Any(p => p.HistoriaId == h.Id && p.Completada));

        if (siguiente == null)
        {
            return Ok(new { completada = true, mensaje = "¡Misión completada!" });
        }

        return Ok(new
        {
            historiaId = siguiente.Id,
            titulo = siguiente.Titulo,
            completada = false
        });
    }

    // ==========================================
    // POST: api/historias/progreso
    // Guardar progreso de una historia
    // ==========================================
    [HttpPost("progreso")]
    public async Task<IActionResult> GuardarProgreso([FromBody] GuardarProgresoDto dto)
    {
        var progreso = await _context.ProgresoHistorias
            .FirstOrDefaultAsync(ph => ph.EstudianteId == dto.EstudianteId 
                && ph.HistoriaId == dto.HistoriaId);

        if (progreso == null)
        {
            progreso = new ProgresoHistoria
            {
                EstudianteId = dto.EstudianteId,
                HistoriaId = dto.HistoriaId,
                EscenaActualId = dto.EscenaActualId,
                Completada = dto.Completada,
                PuntosObtenidos = dto.PuntosObtenidos,
                FechaInicio = DateTime.UtcNow
            };

            _context.ProgresoHistorias.Add(progreso);
        }
        else
        {
            progreso.EscenaActualId = dto.EscenaActualId;
            progreso.Completada = dto.Completada;
            progreso.PuntosObtenidos = dto.PuntosObtenidos;

            if (dto.Completada && !progreso.FechaCompletada.HasValue)
            {
                progreso.FechaCompletada = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Progreso guardado correctamente.",
            progreso.Id,
            progreso.Completada,
            progreso.PuntosObtenidos
        });
    }

    // ==========================================
    // POST: api/historias
    // Crear una nueva historia
    // ==========================================
    [HttpPost]
    public async Task<IActionResult> CrearHistoria([FromBody] CrearHistoriaDto dto)
    {
        // Verificar que la misión existe
        var misionExiste = await _context.Misiones.AnyAsync(m => m.Id == dto.MisionId);
        if (!misionExiste)
        {
            return BadRequest(new { mensaje = "La misión no existe." });
        }

        var historia = new Historia
        {
            Titulo = dto.Titulo,
            Descripcion = dto.Descripcion,
            MisionId = dto.MisionId,
            Orden = dto.Orden,
            PuntosBase = dto.PuntosBase,
            Activa = true,
            FechaCreacion = DateTime.UtcNow
        };

        _context.Historias.Add(historia);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Historia creada correctamente.",
            historia.Id,
            historia.Titulo,
            historia.MisionId,
            historia.Orden
        });
    }

    // ==========================================
    // DELETE: api/historias/{id}
    // ==========================================
    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarHistoria(int id)
    {
        // 1. Buscar la historia
        var historia = await _context.Historias
            .Include(h => h.Escenas)
                .ThenInclude(e => e.Decisiones)
            .Include(h => h.Escenas)
                .ThenInclude(e => e.Pregunta!)
                    .ThenInclude(p => p.Respuestas)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (historia == null)
        {
            return NotFound(new { mensaje = "Historia no encontrada." });
        }

        // 2. ✅ ELIMINAR PROGRESOS PRIMERO (para evitar el error de foreign key)
        var escenaIds = historia.Escenas.Select(e => e.Id).ToList();
        var progresos = await _context.ProgresoHistorias
            .Where(p => escenaIds.Contains(p.EscenaActualId))
            .ToListAsync();
        
        if (progresos.Any())
        {
            _context.ProgresoHistorias.RemoveRange(progresos);
        }

        // 3. Eliminar todo lo demás (decisiones, preguntas, respuestas, escenas)
        foreach (var escena in historia.Escenas)
        {
            if (escena.Decisiones.Any())
            {
                _context.Decisiones.RemoveRange(escena.Decisiones);
            }
            
            if (escena.Pregunta != null)
            {
                if (escena.Pregunta.Respuestas.Any())
                {
                    _context.Respuestas.RemoveRange(escena.Pregunta.Respuestas);
                }
                _context.Preguntas.Remove(escena.Pregunta);
            }
        }

        if (historia.Escenas.Any())
        {
            _context.Escenas.RemoveRange(historia.Escenas);
        }

        _context.Historias.Remove(historia);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensaje = "Historia eliminada correctamente.",
            historiaId = id,
            progresosEliminados = progresos.Count
        });
    }
}