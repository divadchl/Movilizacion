using Elecciones.Models.DBSMovilizacion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Elecciones.Common.Models.Territory
{
    [Serializable]
    public class VEstado : ITerritorio, IDisposable
    {
        protected DBDeteccionEntities MimoContext { get; set; }
        protected CATEstado Estado { get; set; }

        public VEstado()
        {

        }

        public VEstado(int id)
        {
            Id = id;
            MimoContext = new DBDeteccionEntities();
            var edo = MimoContext.CATEstado.FirstOrDefault(s => s.IdEstado == Id);
            if (edo == null) throw new Exception("Estado no Existe");
            Estado = edo;
            EntityMapper();
        }

        public VEstado(CATEstado edo)
        {
            Estado = edo;
            EntityMapper();
        }

        public void EntityMapper()
        {
            Id = Estado.IdEstado;
            Descripcion = Estado.Nombre;
            Firma = String.Format("E: {0}", Estado.Nombre.ToUpper());
            Value = Estado.IdEstado.ToString();
        }

        public int Id { get; private set; }

        public string Descripcion { get; private set; }

        public string Firma { get; private set; }
        public string Value { get; set; }
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
    }
}
