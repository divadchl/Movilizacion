using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    [Serializable]
    public class VDistritoFederal : ITerritorio, IDisposable
    {
        protected DBDeteccionEntities MimoContext { get; set; }
        protected CATDistritoFederal DistritoFederal { get; set; }

        public VDistritoFederal()
        {
        }

        public VDistritoFederal(int id, bool load = true)
        {
            Id = id;
            MimoContext = new DBDeteccionEntities();
            var temp = MimoContext.CATDistritoFederal.FirstOrDefault(s => s.IdDistritoFederal == id);
            if (temp == null) throw new Exception("Distrito Federal no existe");
            DistritoFederal = temp;
            EntityMapper();
        }

        public VDistritoFederal(int edo, int dtoFed)
        {
            MimoContext = new DBDeteccionEntities();
            var temp = MimoContext.CATDistritoFederal.FirstOrDefault(s => s.IdEstado == edo && s.IdDistritoFederal == dtoFed);
            if (temp == null) throw new Exception("Distrito Federal no existe");
            DistritoFederal = temp;
            EntityMapper();
        }

        public VDistritoFederal(CATDistritoFederal dtoFederal)
        {
            DistritoFederal = dtoFederal;
            EntityMapper();
        }

        public void EntityMapper()
        {
            Id = DistritoFederal.IdDistritoFederal;
            Descripcion = DistritoFederal.DistritoFederal.ToString();
            // Firma = String.Format(" > DF: {0:D3}", DistritoFederal.DistritoFederal);
            Value = DistritoFederal.DistritoFederal.ToString();
        }

        public int Id { get; private set; }

        public string Descripcion { get; private set; }

        public string Firma { get; private set; }
        public string Value { get; private set; }
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposing) return;
            if (MimoContext != null)
            {
                MimoContext.Dispose();
            }
        }

        public override int GetHashCode()
        {
            return Id;
        }

        public override bool Equals(object obj)
        {
            return (Id == ((VDistritoFederal)obj).Id);
        }
    }
}
