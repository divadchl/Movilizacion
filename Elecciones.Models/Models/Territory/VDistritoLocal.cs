using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    [Serializable]
    public class VDistritoLocal : ITerritorio, IDisposable
    {
        protected DBDeteccionEntities MimoContext { get; set; }
        protected CATDistritoLocal DistritoLocal { get; set; }

        public VDistritoLocal()
        {

        }

        public VDistritoLocal(int id, bool load = true)
        {
            Id = id;
            MimoContext = new DBDeteccionEntities();
            var temp = MimoContext.CATDistritoLocal.FirstOrDefault(s => s.IdDistritoLocal == id);
            if (temp == null) throw new Exception("Distrito Local no existe");
            DistritoLocal = temp;
            EntityMapper();
        }

        public VDistritoLocal(int edo, int dtoLocal)
        {
            MimoContext = new DBDeteccionEntities();
            var temp = MimoContext.CATDistritoLocal.FirstOrDefault(s => s.IdEstado == edo && s.IdDistritoLocal == dtoLocal);
            if (temp == null) throw new Exception("Distrito Local no existe");
            DistritoLocal = temp;
            EntityMapper();
        }

        public VDistritoLocal(CATDistritoLocal dtoLocal)
        {
            if (dtoLocal == null) return;
            DistritoLocal = dtoLocal;
            EntityMapper();
        }

        //public VDistritoLocal(int idDistritoLocal, int nombre)
        //{
        //    Id = idDistritoLocal;
        //    Descripcion = nombre.ToString(CultureInfo.InvariantCulture);
        //    Firma = String.Format(" > DL: {0:D3}", nombre);
        //}

        public void EntityMapper()
        {
            Id = DistritoLocal.IdDistritoLocal;
            Descripcion = DistritoLocal.DistritoLocal.ToString();
            // Firma = String.Format(" > DL: {0:D3}", DistritoLocal.DistritoLocal);
            Value = DistritoLocal.DistritoLocal.ToString();
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
            return Id == ((VDistritoLocal)obj).Id;
        }
    }
}
