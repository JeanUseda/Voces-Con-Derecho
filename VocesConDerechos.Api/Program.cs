using Microsoft.EntityFrameworkCore;
using VocesConDerechos.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// BASE DE DATOS
// ==========================================

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

// ==========================================
// CONTROLADORES
// ==========================================

builder.Services.AddControllers();

// ==========================================
// CORS - DEBE IR ANTES DE CONSTRUIR LA APP
// ==========================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ==========================================
// SWAGGER
// ==========================================

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ==========================================
// MIDDLEWARES - ORDEN IMPORTANTE
// ==========================================

// 1. CORS - DEBE IR ANTES DE MapControllers
app.UseCors("Frontend");

// 2. SWAGGER
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 3. PRUEBA DE CONEXIÓN A POSTGRESQL
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

// 4. API - DEBE IR DESPUÉS DE UseCors
app.MapControllers();

app.Run();