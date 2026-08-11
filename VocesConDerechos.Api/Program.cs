using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

builder.Services.AddControllers();

var app = builder.Build();

// ==========================================
// PRUEBA DE CONEXIÓN A POSTGRESQL
// ==========================================

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    try
    {
        var conectado = db.Database.CanConnect();

        Console.WriteLine(
            conectado
                ? "✅ Conectado correctamente a PostgreSQL"
                : "❌ No se pudo conectar a PostgreSQL"
        );
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error de conexión: {ex.Message}");
    }
}



app.MapControllers();

app.Run();