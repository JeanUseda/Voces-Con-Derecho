using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace VocesConDerechos.Api.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            
            // Usa la misma cadena de conexión que en appsettings.json
            optionsBuilder.UseNpgsql("Host=localhost;Port=5433;Database=voces_con_derechos;Username=Axelp;Password=Axel04@#");
            
            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
