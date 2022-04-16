using Elecciones.Models.DBSMovilizacion;
using System.Collections.Generic;
using System.Linq;

namespace Elecciones.Logic.Movilizacion
{
    public class PersonasManager
    {
        public static List<DATPersonas> GetDATPersonas()
        {
            using (var ctx = new DBDeteccionEntities())
            {
                return ctx.DATPersonas.ToList();
            }
        }
    }
}
