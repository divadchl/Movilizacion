using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Elecciones.Models.Models.Territory
{
    public static class TerritorioComparer
    {
        public static bool Igual(this TerritorioDataManager terPadre, TerritorioDataManager terHijo)
        {
            var result = false;
            if (terPadre.Territorios.Count() == terHijo.Territorios.Count())
            {
                var temp = terPadre.Territorios.Join(terHijo.Territorios, s => String.Format("{0}{1}", s.Key, s.Value.Id), d => String.Format("{0}{1}", d.Key, d.Value.Id), (s, d) => new { IdBase = String.Format("{0}{1}", s.Key, s.Value.Id), IdNotBase = String.Format("{0}{1}", d.Key, d.Value.Id), });
                if (temp.Count() == terHijo.Territorios.Count())
                    result = true;
            }
            return result;
        }

        public static bool Contain(this TerritorioDataManager terPadre, TerritorioDataManager terHijo)
        {
            var result = false;

            var temp = terPadre.Territorios.Join(terHijo.Territorios, s => String.Format("{0}{1}", s.Key, s.Value.Id), d => String.Format("{0}{1}", d.Key, d.Value.Id), (s, d) => new { IdBase = String.Format("{0}{1}", s.Key, s.Value.Id), IdNotBase = String.Format("{0}{1}", d.Key, d.Value.Id), });
            if (temp.Count() == terPadre.Territorios.Count())
                result = true;

            return result;
        }

        public static bool Belong(this TerritorioDataManager terPadre, TerritorioDataManager terHijo)
        {
            var result = false;

            var temp = terPadre.Territorios.Join(terHijo.Territorios, s => String.Format("{0}{1}", s.Key, s.Value.Id), d => String.Format("{0}{1}", d.Key, d.Value.Id), (s, d) => new { IdBase = String.Format("{0}{1}", s.Key, s.Value.Id), IdNotBase = String.Format("{0}{1}", d.Key, d.Value.Id), });
            if (temp.Count() == terHijo.Territorios.Count())
            {
                result = true;
            }
            else if (temp.Count() == terPadre.Territorios.Count())
            {
                result = true;
            }

            return result;
        }

    }
}
