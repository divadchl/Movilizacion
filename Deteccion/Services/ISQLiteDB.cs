using SQLite;

namespace Deteccion.Services
{
    public interface ISQLiteDB
    {
        SQLiteConnection GetConnection();
        SQLiteAsyncConnection GetConnectionAsync();
    }

}
